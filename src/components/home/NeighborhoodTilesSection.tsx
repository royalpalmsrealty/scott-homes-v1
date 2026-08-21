import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { neighborhoods } from "@/lib/neighborhoods";
import { getNeighborhoodCityId } from "@/lib/listings/idxSearch";
import { fetchIdxResultsCount } from "@/lib/listings/idxScrape";

export async function NeighborhoodTilesSection() {
  // Same 2-bucket real-count approach as /neighborhoods (see that page for
  // why: IDX's geography only goes down to island level, so most of these
  // tiles share one real count). Uses the authoritative IDX-resultsCount
  // rather than counting scraped rows — see idxScrape.ts for why that
  // distinction matters (scraped rows are capped by the page-size request).
  const cityIds = [...new Set(neighborhoods.map((n) => getNeighborhoodCityId(n.name)))];
  const countByCityId = new Map<string, { count: number; isMinimum: boolean }>();
  await Promise.all(
    cityIds.map(async (cityId) => {
      const sampleName = neighborhoods.find((n) => getNeighborhoodCityId(n.name) === cityId)!.name;
      try {
        const result = await fetchIdxResultsCount({ neighborhood: sampleName });
        countByCityId.set(cityId, result);
      } catch {
        countByCityId.set(cityId, { count: 0, isMinimum: false });
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
          const result = countByCityId.get(getNeighborhoodCityId(neighborhood.name)) ?? {
            count: 0,
            isMinimum: false,
          };
          return (
            <NeighborhoodCard
              key={neighborhood.slug}
              neighborhood={neighborhood}
              priority={i < 2}
              activeCount={result.count}
              countLabel={result.isMinimum ? `${result.count}+ Active Listings` : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
