import { NextResponse } from "next/server";
import { CreateOfferSchema } from "@/lib/schemas/offer";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchListingDetail, buildOwnListingUrl } from "@/lib/listings/idxScrape";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`offer-create:${ip}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Offers aren't available right now." }, { status: 503 });
  }

  const json = await request.json().catch(() => null);
  const parsed = CreateOfferSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Property fields always come from a fresh live-MLS fetch, never the
  // client — an offer can't be opened against a price/address we made up or
  // that the buyer's browser sent us.
  const { listingId, addressSlug } = parsed.data;
  const listing = await fetchListingDetail(listingId, addressSlug).catch(() => null);
  if (!listing) {
    return NextResponse.json({ error: "That listing couldn't be found." }, { status: 404 });
  }

  const { error, data } = await getSupabase()
    .from("offers")
    .insert({
      listing_id: listingId,
      listing_mls_id: listing.mlsId,
      listing_address: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
      listing_price: listing.price,
      listing_url: buildOwnListingUrl({ listingId, addressSlug }),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create offer", error);
    return NextResponse.json({ error: "Couldn't start an offer right now." }, { status: 500 });
  }

  return NextResponse.json({ offerId: data.id, listing });
}
