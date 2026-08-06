import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { neighborhoods } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "Key West Neighborhoods",
  description:
    "Explore Key West's neighborhoods — from Old Town's historic Conch houses to the private island of Sunset Key — with Royal Palms Realty.",
};

export default function NeighborhoodsPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading
        eyebrow="Explore Key West"
        heading="Neighborhoods"
        as="h1"
      />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        Every part of Key West has a different character — from Old Town&rsquo;s historic
        density to Sunset Key&rsquo;s private-island seclusion. Explore each neighborhood to
        see active listings, market data, and what makes it distinct.
      </p>

      <div className="mt-10 grid gap-x-10 gap-y-14 sm:grid-cols-2">
        {neighborhoods.map((neighborhood, i) => (
          <div key={neighborhood.slug}>
            <NeighborhoodCard
              neighborhood={neighborhood}
              aspectClassName="aspect-[4/5] sm:aspect-[4/3]"
              priority={i < 2}
            />
            <p className="mt-4 font-sans text-sm text-body">{neighborhood.overview[0]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
