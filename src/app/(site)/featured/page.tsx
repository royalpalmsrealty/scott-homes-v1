import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrapedListingCard } from "@/components/listings/ScrapedListingCard";
import { fetchFeaturedListings } from "@/lib/listings/idxScrape";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic"; // always a live MLS lookup

export const metadata: Metadata = {
  title: "Featured Listings",
  description: `${brand.broker.name}'s featured Key West listings.`,
};

export default async function FeaturedPage() {
  let listings: Awaited<ReturnType<typeof fetchFeaturedListings>> = [];
  let fetchError = false;
  try {
    listings = await fetchFeaturedListings(24);
  } catch (err) {
    console.error("Featured page listings fetch failed", err);
    fetchError = true;
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Featured" heading="Featured Listings" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        {brand.broker.name}&rsquo;s featured active listings — pulled live from the Florida Keys
        MLS.
      </p>

      {fetchError ? (
        <div className="mt-10 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            We couldn&rsquo;t reach the live MLS feed just now — please refresh in a moment.
          </p>
        </div>
      ) : listings.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ScrapedListingCard
              key={listing.listingId}
              listing={listing}
              backHref="/featured"
              backLabel="Back to Featured Listings"
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            Nothing to show right now — check back soon.
          </p>
        </div>
      )}

      <p className="mt-8 font-sans text-xs text-muted">
        Results sourced live from the Florida Keys MLS via IDX Broker.
      </p>
    </section>
  );
}
