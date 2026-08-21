import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { queueLead } from "@/lib/leadQueue";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`offer-submit:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Offers aren't available right now." }, { status: 503 });
  }

  const { data: offer } = await getSupabase().from("offers").select("*").eq("id", id).maybeSingle();
  if (!offer) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
  if (offer.status !== "draft") {
    return NextResponse.json({ error: "This offer has already been submitted." }, { status: 409 });
  }
  if (!offer.buyer_name || !offer.buyer_email || !offer.offer_price) {
    return NextResponse.json({ error: "This offer is missing required fields." }, { status: 400 });
  }

  const { error: updateError } = await getSupabase()
    .from("offers")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft");
  if (updateError) {
    console.error("Failed to finalize offer", updateError);
    return NextResponse.json({ error: "Couldn't submit the offer right now." }, { status: 500 });
  }

  const summary: Record<string, string> = {
    offerId: id,
    listingAddress: offer.listing_address,
    listingPrice: String(offer.listing_price),
    listingUrl: offer.listing_url,
    offerPrice: String(offer.offer_price),
    escrowAmount: offer.escrow_amount != null ? String(offer.escrow_amount) : "",
    escrowPercent: offer.escrow_percent != null ? String(offer.escrow_percent) : "",
    financing: offer.financing ?? "",
    inspectionDays: offer.inspection_days != null ? String(offer.inspection_days) : "",
    titleCostsNote: offer.title_costs_note ?? "",
    closingDate: offer.closing_date ?? "",
    specialClauses: offer.special_clauses ?? "",
    saleOfPropertyNotes: offer.sale_of_property_notes ?? "",
    personalProperty: offer.personal_property ?? "",
    titleTakenAs: offer.title_taken_as ?? "",
  };

  const leadPayload = {
    source: "make-an-offer",
    tags: ["offer", "offer-submitted"],
    ...summary,
    buyerName: offer.buyer_name,
    buyerEmail: offer.buyer_email,
    buyerPhone: offer.buyer_phone,
  };

  let ghlError: string | null = null;
  try {
    if (isGhlConfigured()) {
      await sendToGhl({
        name: offer.buyer_name,
        email: offer.buyer_email,
        phone: offer.buyer_phone ?? undefined,
        tags: leadPayload.tags,
        customFields: summary,
      });
    } else {
      await queueLead(leadPayload);
    }
  } catch (error) {
    ghlError = String(error);
    await queueLead({ ...leadPayload, ghlError });
  }

  if (ghlError) {
    await getSupabase().from("offers").update({ ghl_error: ghlError }).eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
