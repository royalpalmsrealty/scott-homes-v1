import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrapedListingCard } from "@/components/listings/ScrapedListingCard";
import { SearchFilterForm } from "@/components/search/SearchFilterForm";
import { parseSearchQuery } from "@/lib/ai/searchParser";
import { fetchIdxListings, fetchIdxResultsCount } from "@/lib/listings/idxScrape";
import { neighborhoodWasBroadened } from "@/lib/listings/idxSearch";
import { neighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic"; // always a live MLS lookup

export const metadata: Metadata = {
  title: "Search Listings",
  robots: { index: false }, // query-dependent page — not a canonical indexable URL
};

type SearchPageParams = {
  q?: string;
  neighborhood?: string;
  minPrice?: string;
  maxPrice?: string;
  minBeds?: string;
  type?: string;
  feature?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const manualFiltersSet = Boolean(
    params.neighborhood || params.minPrice || params.maxPrice || params.minBeds
  );

  // A manually chosen filter always wins over whatever the AI guessed from
  // the keyword text — e.g. picking a neighborhood chip after typing a
  // phrase that named a different one.
  let usedFallback = false;
  let aiNeighborhood: string | null = null;
  let aiMinPrice: number | null = null;
  let aiMaxPrice: number | null = null;
  let aiMinBeds: number | null = null;

  if (q && !manualFiltersSet) {
    const parsed = await parseSearchQuery(q);
    aiNeighborhood = parsed.filters.neighborhood;
    aiMinPrice = parsed.filters.minPrice;
    aiMaxPrice = parsed.filters.maxPrice;
    aiMinBeds = parsed.filters.minBeds;
    usedFallback = parsed.usedFallback;
  }

  const neighborhood = params.neighborhood || aiNeighborhood || null;
  const filters = {
    neighborhood,
    minPrice: params.minPrice ? Number(params.minPrice) : aiMinPrice,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : aiMaxPrice,
    minBeds: params.minBeds ? Number(params.minBeds) : aiMinBeds,
    condo: params.type === "condo",
    waterfront: params.feature === "waterfront",
  };
  const broadened = neighborhoodWasBroadened(neighborhood);

  // So a listing opened from these results can send "Back" to this exact
  // search — same query, same filters — instead of a blank /search.
  const backParams = new URLSearchParams();
  if (params.q) backParams.set("q", params.q);
  if (params.neighborhood) backParams.set("neighborhood", params.neighborhood);
  if (params.minPrice) backParams.set("minPrice", params.minPrice);
  if (params.maxPrice) backParams.set("maxPrice", params.maxPrice);
  if (params.minBeds) backParams.set("minBeds", params.minBeds);
  if (params.type) backParams.set("type", params.type);
  if (params.feature) backParams.set("feature", params.feature);
  const backQuery = backParams.toString();
  const backHref = `/search${backQuery ? `?${backQuery}` : ""}`;

  // With nothing to search on, an unfiltered fetch means IDX has to render
  // its entire ~500-listing board server-side — measured at 18+ seconds,
  // versus 2-5s for any filtered request. Skip it and prompt instead,
  // matching /search/ai's existing empty-query behavior.
  const hasAnyFilter = Boolean(
    q || filters.neighborhood || filters.minPrice || filters.maxPrice || filters.minBeds || filters.condo || filters.waterfront
  );

  const [listings, resultsCount] = hasAnyFilter
    ? await Promise.all([
        fetchIdxListings(filters, 24).catch(() => []),
        fetchIdxResultsCount(filters).catch(() => ({ count: 0, isMinimum: false })),
      ])
    : [[] as Awaited<ReturnType<typeof fetchIdxListings>>, { count: 0, isMinimum: false }];

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Key West MLS" heading="Search Listings" as="h1" />
      <p className="mt-4 max-w-2xl font-sans text-base text-body">
        Search in your own words, then narrow with the filters below — results pull live from
        the Florida Keys MLS.
      </p>

      <div className="mt-8">
        <SearchFilterForm
          initialQuery={q}
          initialNeighborhood={neighborhood}
          initialMinPrice={filters.minPrice}
          initialMaxPrice={filters.maxPrice}
          initialMinBeds={filters.minBeds}
          initialCondo={filters.condo}
          initialWaterfront={filters.waterfront}
          neighborhoodOptions={neighborhoods.map((n) => n.name)}
        />
      </div>

      {hasAnyFilter ? (
        <>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <p className="font-sans text-sm text-muted">
              {resultsCount.isMinimum
                ? `${resultsCount.count}+ live results`
                : `${resultsCount.count} live result${resultsCount.count === 1 ? "" : "s"}`}
            </p>
          </div>

          {usedFallback && (
            <p className="mt-2 max-w-xl font-sans text-sm text-gold-deep">
              We couldn&rsquo;t confidently parse that phrase into filters — showing everything
              that matches your other filters instead.
            </p>
          )}

          {broadened && (
            <p className="mt-3 max-w-xl font-sans text-xs text-muted">
              Note: the MLS search can&rsquo;t narrow to the specific &ldquo;{neighborhood}&rdquo;
              area — these results cover all of Key West Island instead.
            </p>
          )}

          {listings.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ScrapedListingCard
                  key={listing.listingId}
                  listing={listing}
                  backHref={backHref}
                  backLabel="Back to Search"
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-line bg-paper p-8 text-center">
              <p className="font-sans text-base text-body">
                Nothing matches those filters right now. Try loosening one above.
              </p>
            </div>
          )}

          <p className="mt-8 font-sans text-xs text-muted">
            Results sourced live from the Florida Keys MLS via IDX Broker.
          </p>
        </>
      ) : (
        <div className="mt-10 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            Describe what you&rsquo;re looking for, or set a filter above, then hit Search.
          </p>
        </div>
      )}
    </section>
  );
}
