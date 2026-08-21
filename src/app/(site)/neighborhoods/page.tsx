import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { NeighborhoodFilterChips } from "@/components/neighborhoods/NeighborhoodFilterChips";
import { neighborhoods } from "@/lib/neighborhoods";
import { getNeighborhoodCityId } from "@/lib/listings/idxSearch";
import { fetchIdxResultsCount } from "@/lib/listings/idxScrape";

export const dynamic = "force-dynamic"; // counts are a live MLS lookup, not static content

export const metadata: Metadata = {
  title: "Key West Neighborhoods",
  description:
    "Explore Key West's neighborhoods — from Old Town's historic Conch houses to the private island of Sunset Key — with Royal Palms Realty.",
};

export default async function NeighborhoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; feature?: string }>;
}) {
  const { type, feature } = await searchParams;
  const filters = { condo: type === "condo", waterfront: feature === "waterfront" };

  // Only 2 distinct real geographic buckets exist across all 10 neighborhood
  // tiles (see idxSearch.ts) — Shark Key, and everything else broadened to
  // Key West Island — so this is 2 live fetches total, not 10.
  const cityIds = [...new Set(neighborhoods.map((n) => getNeighborhoodCityId(n.name)))];
  const countByCityId = new Map<string, { count: number; isMinimum: boolean }>();
  await Promise.all(
    cityIds.map(async (cityId) => {
      try {
        // fetchIdxResultsCount doesn't take a raw cityId, so scope via the
        // neighborhood name that maps to it instead (any one will do — the
        // URL builder only cares about the resolved cityId, not the label).
        const sampleName = neighborhoods.find((n) => getNeighborhoodCityId(n.name) === cityId)!.name;
        const result = await fetchIdxResultsCount({ ...filters, neighborhood: sampleName });
        countByCityId.set(cityId, result);
      } catch {
        countByCityId.set(cityId, { count: 0, isMinimum: false });
      }
    })
  );

  const queryString = new URLSearchParams({
    ...(type ? { type } : {}),
    ...(feature ? { feature } : {}),
  }).toString();

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      {/* Same restrained blurred-orb wash used on the About and Contact pages. */}
      <span
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-[0.15] blur-[110px]"
        aria-hidden="true"
        style={{ background: "var(--teal)" }}
      />
      <span
        className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full opacity-[0.15] blur-[100px]"
        aria-hidden="true"
        style={{ background: "var(--gold)" }}
      />

      <div className="relative mx-auto max-w-[1280px]">
        <SectionHeading eyebrow="Explore Key West" heading="Neighborhoods" as="h1" />
        <p className="mt-6 max-w-2xl font-sans text-base text-body">
          Every part of Key West has a different character — from Old Town&rsquo;s historic
          density to Sunset Key&rsquo;s private-island seclusion. Filter by Condo or Waterfront,
          or explore each neighborhood to see active listings and what makes it distinct.
        </p>
        <p className="mt-2 font-sans text-xs text-muted">
          Active listing counts below are live from the Florida Keys MLS. Median price and days
          on market (shown on each neighborhood&rsquo;s page) are still sample data pending a
          full market-stats integration.
        </p>

        <div className="mt-6">
          <NeighborhoodFilterChips />
        </div>
        <p className="mt-2 font-sans text-xs text-muted">
          Note: IDX&rsquo;s MLS search can only narrow geography to island level, not Key
          West&rsquo;s individual neighborhoods (Shark Key is the one exception, being its own
          island) — so most tiles below share the same island-wide count for now.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {neighborhoods.map((neighborhood, i) => {
            const cityId = getNeighborhoodCityId(neighborhood.name);
            const result = countByCityId.get(cityId) ?? { count: 0, isMinimum: false };
            const href = queryString
              ? `/neighborhoods/${neighborhood.slug}?${queryString}`
              : `/neighborhoods/${neighborhood.slug}`;

            return (
              <div key={neighborhood.slug}>
                <NeighborhoodCard
                  neighborhood={neighborhood}
                  aspectClassName="aspect-[4/5] sm:aspect-[4/3]"
                  priority={i < 2}
                  activeCount={result.count}
                  countLabel={result.isMinimum ? `${result.count}+ Active Listings` : undefined}
                  href={href}
                />
                <p className="mt-4 font-sans text-sm text-body">{neighborhood.overview[0]}</p>
                {(neighborhood.daysOnMarket !== undefined || neighborhood.activeInventory !== undefined) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {neighborhood.daysOnMarket !== undefined && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-sans text-xs font-medium text-gold-deep">
                        <ClockIcon />
                        {neighborhood.daysOnMarket} Days on Market
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
