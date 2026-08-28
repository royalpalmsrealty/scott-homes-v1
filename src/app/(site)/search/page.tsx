import type { Metadata } from "next";
import { SearchFilterForm } from "@/components/search/SearchFilterForm";
import { IdxEmbed } from "@/components/listings/IdxEmbed";
import { parseSearchQuery } from "@/lib/ai/searchParser";
import { buildIdxSearchUrl, getNeighborhoodFilterStatus } from "@/lib/listings/idxSearch";
import { neighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

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
  // Key West board mislabeled as neighborhood-specific results). Still a pure
  // local check — no fetch involved — so this keeps working unchanged even
  // though results themselves are now an embed, not a scrape.
  const neighborhoodUnavailable = Boolean(neighborhood) && !neighborhoodStatus?.available;

  const hasAnyFilter = Boolean(
    q || filters.neighborhood || filters.minPrice || filters.maxPrice || filters.minBeds || filters.condo || filters.waterfront
  );

  const resultsUrl = buildIdxSearchUrl(filters);

  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-paper p-5 shadow-sm sm:p-7">
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

        {neighborhoodUnavailable ? (
          <div className="mt-10 rounded-3xl border border-line bg-paper p-10 text-center">
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
            {usedFallback && (
              <p className="mt-6 max-w-xl font-sans text-sm text-gold-deep">
                We couldn&rsquo;t confidently parse that phrase into filters — showing everything
                that matches your other filters instead.
              </p>
            )}
            <div className="mt-6 overflow-hidden rounded-3xl border border-line">
              <IdxEmbed src={resultsUrl} title="Search Results" />
            </div>
            <p className="mt-4 font-sans text-xs text-muted">
              Results sourced live from the Florida Keys MLS via IDX Broker. Clicking a listing
              opens its full details on our MLS partner&rsquo;s site.
            </p>
          </>
        ) : (
          <p className="mt-10 text-center font-sans text-sm text-muted">
            Describe what you&rsquo;re looking for, or set a filter above, then hit Search.
          </p>
        )}
      </section>
    </>
  );
}
