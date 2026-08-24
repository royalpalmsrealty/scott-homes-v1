import { NextResponse } from "next/server";
import { fetchIdxListings } from "@/lib/listings/idxScrape";
import { getNeighborhoodFilterStatus } from "@/lib/listings/idxSearch";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`listings-search:${ip}`, 30, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const neighborhood = searchParams.get("neighborhood");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minBeds = searchParams.get("minBeds");

  // Client-reported bug fix (2026-08-22): a neighborhood IDX can't filter
  // precisely used to silently fall through to an unbounded search here —
  // refuse instead of returning unrelated properties (or, worse, the whole
  // multi-county board once the "always default to Key West" fallback was
  // removed from buildIdxSearchUrl).
  if (neighborhood) {
    const status = getNeighborhoodFilterStatus(neighborhood);
    if (!status.available) {
      return NextResponse.json(
        { error: `Live MLS search can't be narrowed to "${neighborhood}" specifically.`, neighborhoodUnavailable: true },
        { status: 200 }
      );
    }
  }

  try {
    const listings = await fetchIdxListings({
      neighborhood: neighborhood || null,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      minBeds: minBeds ? Number(minBeds) : null,
    });
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Listing search failed", error);
    return NextResponse.json({ error: "Failed to load listings." }, { status: 502 });
  }
}
