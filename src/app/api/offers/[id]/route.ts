import { NextResponse } from "next/server";
import { OfferPatchSchema } from "@/lib/schemas/offer";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`offer-patch:${ip}`, 60, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Offers aren't available right now." }, { status: 503 });
  }

  const json = await request.json().catch(() => null);
  const parsed = OfferPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const f = parsed.data;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (f.buyerName !== undefined) update.buyer_name = f.buyerName;
  if (f.buyerEmail !== undefined) update.buyer_email = f.buyerEmail;
  if (f.buyerPhone !== undefined) update.buyer_phone = f.buyerPhone;
  if (f.offerPrice !== undefined) update.offer_price = f.offerPrice;
  if (f.escrowAmount !== undefined) update.escrow_amount = f.escrowAmount;
  if (f.escrowPercent !== undefined) update.escrow_percent = f.escrowPercent;
  if (f.financing !== undefined) update.financing = f.financing;
  if (f.inspectionDays !== undefined) update.inspection_days = f.inspectionDays;
  // Only ever set once, the moment the reminder is actually rendered client-side
  // — never overwritten, so the original "shown at" timestamp always holds.
  if (f.inspectionReminderShown) update.inspection_reminder_shown_at = new Date().toISOString();
  if (f.titleCostsNote !== undefined) update.title_costs_note = f.titleCostsNote;
  if (f.closingDate !== undefined) update.closing_date = f.closingDate;
  if (f.specialClauses !== undefined) update.special_clauses = f.specialClauses;
  if (f.saleOfPropertyNotes !== undefined) update.sale_of_property_notes = f.saleOfPropertyNotes;
  if (f.personalProperty !== undefined) update.personal_property = f.personalProperty;
  if (f.titleTakenAs !== undefined) update.title_taken_as = f.titleTakenAs;

  const { error } = await getSupabase().from("offers").update(update).eq("id", id).eq("status", "draft");
  if (error) {
    console.error("Failed to update offer", error);
    return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
