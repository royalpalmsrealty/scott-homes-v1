import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodPhoto } from "@/components/neighborhoods/NeighborhoodPhoto";
import { NeighborhoodAlertForm } from "@/components/neighborhoods/NeighborhoodAlertForm";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { neighborhoods, getNeighborhood, getAdjacentNeighborhoods } from "@/lib/neighborhoods";
import { dummyListings } from "@/lib/dummyListings";

export function generateStaticParams() {
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = getNeighborhood(slug);
  if (!neighborhood) return {};

  return {
    title: `${neighborhood.name} Key West Homes for Sale`,
    description: `${neighborhood.tileBlurb} Explore active listings, market data, and what makes ${neighborhood.name} distinct — with Royal Palms Realty.`,
  };
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const neighborhood = getNeighborhood(slug);
  if (!neighborhood) notFound();

  const activeListings = dummyListings.filter((l) => l.neighborhood === neighborhood.name);
  const adjacent = getAdjacentNeighborhoods(slug);

  const stats = [
    { label: "Median Price", value: `$${neighborhood.medianPrice.toLocaleString("en-US")}` },
    { label: "Days on Market", value: `${neighborhood.daysOnMarket}` },
    { label: "Active Inventory", value: `${neighborhood.activeInventory}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            name: `${neighborhood.name}, Key West, FL`,
            description: neighborhood.tileBlurb,
          }),
        }}
      />

      <NeighborhoodPhoto
        name={neighborhood.name}
        image={neighborhood.image}
        imageAlt={neighborhood.imageAlt}
        priority
        className="h-[40vh] min-h-[280px] w-full"
      />

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading eyebrow="Key West Neighborhood" heading={neighborhood.name} as="h1" />

        {/* TODO-CLIENT-ASSET: general, non-fabricated overview copy pending client review */}
        <div className="mt-6 max-w-2xl">
          {neighborhood.overview.map((paragraph, i) => (
            <p key={i} className="mt-4 font-sans text-base text-body first:mt-0">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Market information — sample data until the MLS layer (Phase 4) is wired up. */}
        <div className="mt-10 grid grid-cols-3 gap-4 border border-line p-6 sm:max-w-lg">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl text-gold">{stat.value}</p>
              <p className="mt-1 font-sans text-xs uppercase tracking-wide text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 font-sans text-xs text-muted">
          Sample market data — connects to live figures once the MLS layer is wired up.
        </p>
      </section>

      <section className="bg-paper py-14 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Active Listings"
            heading={`Homes for Sale in ${neighborhood.name}`}
            as="h2"
          />
          {activeListings.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeListings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-line bg-white p-8 text-center">
              <p className="font-sans text-base text-body">
                No active listings in {neighborhood.name} right now.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
              >
                Search All Key West Listings
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Lead-capture CTA */}
      <section className="bg-ink py-14 sm:py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <p className="font-display text-2xl text-white sm:text-3xl">
              Get {neighborhood.name} Listing Alerts
            </p>
            <p className="max-w-lg font-sans text-sm text-white/70">
              Be the first to know when a new home hits the market in {neighborhood.name} —
              no spam, unsubscribe any time.
            </p>
            <div className="mt-2 w-full max-w-xl">
              <NeighborhoodAlertForm
                neighborhoodSlug={neighborhood.slug}
                neighborhoodName={neighborhood.name}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading eyebrow="Nearby" heading="Explore Other Neighborhoods" as="h2" />
        <div className="mt-8 flex flex-wrap gap-3">
          {adjacent.map((n) => (
            <Link
              key={n.slug}
              href={`/neighborhoods/${n.slug}`}
              className="border border-line px-5 py-2.5 font-sans text-sm text-body transition-colors hover:border-teal-deep hover:text-teal-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
            >
              {n.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
