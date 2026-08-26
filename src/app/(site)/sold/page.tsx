import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SoldListingCard } from "@/components/listings/SoldListingCard";
import { fetchSoldListings } from "@/lib/listings/idxScrape";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic"; // always a live MLS lookup

export const metadata: Metadata = {
  title: "Recently Sold",
  description: `A look at ${brand.broker.name}'s recently sold Key West listings.`,
};

export default async function SoldPage() {
  let listings: Awaited<ReturnType<typeof fetchSoldListings>> = [];
  let fetchError = false;
  try {
    listings = await fetchSoldListings(24);
  } catch (err) {
    console.error("Sold page listings fetch failed", err);
    fetchError = true;
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Track Record" heading="Recently Sold" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        A look at homes {brand.broker.name} has personally sold — pulled live from the Florida
        Keys MLS, not a curated highlight reel.
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
            <SoldListingCard key={listing.listingId} listing={listing} />
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
        Sold data sourced live from the Florida Keys MLS via IDX Broker.
      </p>
    </section>
  );
}
