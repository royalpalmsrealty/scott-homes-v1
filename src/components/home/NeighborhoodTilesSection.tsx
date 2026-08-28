import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { neighborhoods } from "@/lib/neighborhoods";
import { getNeighborhoodFilterStatus } from "@/lib/listings/idxSearch";
import { fetchIdxResultsCount } from "@/lib/listings/idxScrape";

export async function NeighborhoodTilesSection() {
  // This is the homepage — highest-traffic page on the site — so these 10
  // parallel count checks lean on fetchIdxHtml's own 5-minute cache more
  // than anywhere else: only the first visitor in any 5-minute window
  // actually triggers live requests, everyone else in that window gets the
  // cached count for free.
  const countByName = new Map<string, { count: number; isMinimum: boolean }>();
  await Promise.all(
    neighborhoods
      .filter((n) => getNeighborhoodFilterStatus(n.name).available)
      .map(async (n) => {
        try {
          countByName.set(n.name, await fetchIdxResultsCount({ neighborhood: n.name }));
        } catch {
          // No count shown rather than a false 0.
        }
      })
  );

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Explore Key West" heading="Neighborhoods" as="h2" />
        <Link
          href="/neighborhoods"
          className="mb-1 font-sans text-sm font-medium text-teal-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          View All Neighborhoods &rarr;
        </Link>
      </div>

      {/* 4-up desktop, 2-up tablet, 2-up mobile — these tiles are a primary
          navigation path, not decoration, so mobile never drops to 1-up (R6). */}
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {neighborhoods.map((neighborhood, i) => {
          const result = countByName.get(neighborhood.name);
          return (
            <NeighborhoodCard
              key={neighborhood.slug}
              neighborhood={neighborhood}
              priority={i < 2}
              activeCount={result?.count}
              countLabel={result?.isMinimum ? `${result.count}+ Active Listings` : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
