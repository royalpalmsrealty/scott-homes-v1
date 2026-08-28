import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { NeighborhoodFilterChips } from "@/components/neighborhoods/NeighborhoodFilterChips";
import { neighborhoods } from "@/lib/neighborhoods";
import { getNeighborhoodFilterStatus } from "@/lib/listings/idxSearch";
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

  // Each of these hits fetchIdxHtml's own cache first (5-min fresh window),
  // so repeated page loads within that window cost zero extra requests.
  const countByName = new Map<string, { count: number; isMinimum: boolean }>();
  await Promise.all(
    neighborhoods
      .filter((n) => getNeighborhoodFilterStatus(n.name).available)
      .map(async (n) => {
        try {
          countByName.set(n.name, await fetchIdxResultsCount({ ...filters, neighborhood: n.name }));
        } catch {
          // No count shown rather than a false 0 — see NeighborhoodCard's
          // undefined-vs-0 handling.
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
          Median price and days on market shown on each neighborhood&rsquo;s page are still
          sample data pending a full market-stats integration.
        </p>

        <div className="mt-6">
          <NeighborhoodFilterChips />
        </div>

        <div className="mt-10 grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {neighborhoods.map((neighborhood, i) => {
            const href = queryString
              ? `/neighborhoods/${neighborhood.slug}?${queryString}`
              : `/neighborhoods/${neighborhood.slug}`;
            const result = countByName.get(neighborhood.name);

            return (
              <div key={neighborhood.slug}>
                <NeighborhoodCard
                  neighborhood={neighborhood}
                  aspectClassName="aspect-[4/5] sm:aspect-[4/3]"
                  priority={i < 2}
                  activeCount={result?.count}
                  countLabel={result?.isMinimum ? `${result.count}+ Active Listings` : undefined}
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
