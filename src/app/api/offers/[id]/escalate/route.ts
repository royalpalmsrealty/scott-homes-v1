import { NextResponse } from "next/server";
import { EscalateOfferSchema } from "@/lib/schemas/offer";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { queueLead } from "@/lib/leadQueue";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";

// Live-agent escalation — available at every step of the flow. This project's
// established convention (see the cron blog-draft route) is that all email/SMS
// alerting goes through GHL automations, not a separate provider, so
// "immediately alert Scott" here means submitting to GHL with a tag its own
// workflow can act on.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`offer-escalate:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "This isn't available right now — please call directly." }, { status: 503 });
  }

  const json = await request.json().catch(() => null);
  const parsed = EscalateOfferSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { company, callbackPhone, callbackBestTime } = parsed.data;
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const { data: offer } = await getSupabase()
    .from("offers")
    .select("id, buyer_name, buyer_email, listing_address")
    .eq("id", id)
    .maybeSingle();
  if (!offer) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  await getSupabase()
    .from("offers")
    .update({
      status: "escalated",
      callback_requested: true,
      callback_phone: callbackPhone,
      callback_best_time: callbackBestTime ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const leadPayload = {
    source: "make-an-offer",
    tags: ["offer", "offer-escalation-urgent"],
    offerId: id,
    listingAddress: offer.listing_address,
    buyerName: offer.buyer_name,
    callbackPhone,
    callbackBestTime,
  };

  try {
    if (isGhlConfigured()) {
      await sendToGhl({
        name: offer.buyer_name || "Buyer requesting callback",
        email: offer.buyer_email || "",
        phone: callbackPhone,
        tags: leadPayload.tags,
        customFields: {
          offerId: id,
          listingAddress: offer.listing_address,
          callbackBestTime: callbackBestTime ?? "",
        },
      });
    } else {
      await queueLead(leadPayload);
    }
  } catch (error) {
    await queueLead({ ...leadPayload, ghlError: String(error) });
  }

  return NextResponse.json({ ok: true });
}
