import type { Metadata } from "next";
import { SearchFilterForm } from "@/components/search/SearchFilterForm";
import { MapView } from "@/components/listings/MapView";
import { ScrapedListingCard } from "@/components/listings/ScrapedListingCard";
import { parseSearchQuery } from "@/lib/ai/searchParser";
import { fetchIdxListings, fetchIdxResultsCount } from "@/lib/listings/idxScrape";
import { getNeighborhoodFilterStatus } from "@/lib/listings/idxSearch";
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
  const neighborhoodStatus = neighborhood ? getNeighborhoodFilterStatus(neighborhood) : null;
  // Client-reported bug fix (2026-08-22): if a neighborhood was requested but
  // IDX can't filter to it precisely, show an error instead of quietly
  // running the search without that filter (which used to return the whole
  // Key West board mislabeled as neighborhood-specific results).
  const neighborhoodUnavailable = Boolean(neighborhood) && !neighborhoodStatus?.available;

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

  const [listings, resultsCount] = hasAnyFilter && !neighborhoodUnavailable
    ? await Promise.all([
        fetchIdxListings(filters, 24).catch(() => []),
        fetchIdxResultsCount(filters).catch(() => ({ count: 0, isMinimum: false })),
      ])
    : [[] as Awaited<ReturnType<typeof fetchIdxListings>>, { count: 0, isMinimum: false }];

  return (
    <>
      {/* The map fills the whole first screen instead of a static photo —
          the filter bar floats over its top edge, so both are visible at
          once with zero scrolling. Scrolling only ever gets you to the
          results grid below. */}
      <section className="relative h-[85vh] min-h-[560px] w-full">
        {/* isolate traps Leaflet's own internal panes (it uses z-index up to
            700 for markers/popups) inside this box, so they can never climb
            above the filter card floating on top of it. */}
        <div className="absolute inset-0 isolate">
          <MapView listings={neighborhoodUnavailable ? [] : listings} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-ink/70 to-transparent" />

        <div className="absolute inset-x-0 top-6 z-10 mx-auto w-full max-w-[900px] px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-white/95 p-5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md sm:p-7">
            <span
              className="absolute inset-x-0 top-0 h-[3px]"
              aria-hidden="true"
              style={{ background: "linear-gradient(90deg, var(--teal) 0%, var(--gold) 100%)" }}
            />
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">Key West MLS</p>
            <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">Search Listings</h1>

            <div className="mt-4">
              <SearchFilterForm
                initialQuery={q}
                initialNeighborhood={neighborhood}
                initialMinPrice={filters.minPrice}
                initialMaxPrice={filters.maxPrice}
                initialMinBeds={filters.minBeds}
                initialCondo={filters.condo}
                initialWaterfront={filters.waterfront}
                neighborhoodOptions={neighborhoods.map((n) => n.name)}
                compact
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {neighborhoodUnavailable ? (
          <div className="rounded-3xl border border-line bg-paper p-10 text-center">
            <p className="font-sans text-base text-body">
              Live MLS search can&rsquo;t currently be narrowed to &ldquo;{neighborhood}&rdquo;
              specifically — IDX Broker&rsquo;s public search for this account doesn&rsquo;t expose
              that level of neighborhood detail, so we&rsquo;re not showing unrelated Key West
              listings here instead. Try a different neighborhood, or clear it to search all of
              Key West.
            </p>
          </div>
        ) : hasAnyFilter ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="inline-flex items-center gap-2 font-sans text-sm font-medium text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
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

            {listings.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ScrapedListingCard key={listing.listingId} listing={listing} backHref={backHref} backLabel="Back to Search" />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-line bg-paper p-10 text-center">
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
          <p className="text-center font-sans text-sm text-muted">
            Describe what you&rsquo;re looking for, or set a filter above, then hit Search.
          </p>
        )}
      </section>
    </>
  );
}
