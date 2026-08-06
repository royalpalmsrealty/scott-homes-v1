import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { neighborhoods } from "@/lib/neighborhoods";

export function NeighborhoodTilesSection() {
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
        {neighborhoods.map((neighborhood, i) => (
          <NeighborhoodCard key={neighborhood.slug} neighborhood={neighborhood} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
