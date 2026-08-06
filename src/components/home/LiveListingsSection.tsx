import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { listingProvider, type Listing } from "@/lib/listings/provider";

const FEED_SIZE = 6;

async function getFeedListings(): Promise<{ listings: Listing[]; degraded: boolean }> {
  try {
    const listings = await listingProvider.getRecent(FEED_SIZE);
    return { listings, degraded: false };
  } catch (error) {
    // Real provider failure path: serve nothing rather than crash the
    // homepage. A real MLS-backed provider should catch here too and return
    // its last successfully cached set — see D1 for the sync/cache plan.
    console.error("Live listings feed failed to load", error);
    return { listings: [], degraded: true };
  }
}

export async function LiveListingsSection() {
  const { listings, degraded } = await getFeedListings();

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Just Listed" heading="New in the Last 24 Hours" as="h2" />
        <Link
          href="/search/new-24-hours"
          className="mb-1 font-sans text-sm font-medium text-teal-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          View All New Listings &rarr;
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            {degraded
              ? "The live feed is temporarily unavailable — check back shortly, or browse everything on the market."
              : "Nothing new to show right now — check back soon, or browse everything on the market."}
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
          >
            Search All Key West Listings
          </Link>
        </div>
      ) : (
        // Mobile: horizontal scroll-snap rail with a peek of the next card.
        // sm+: resets to a real grid — 2-up tablet, 3-up (3×2) desktop.
        <div className="mt-10 flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory sm:mx-0 sm:grid sm:snap-none sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="w-[85%] shrink-0 snap-start sm:w-auto sm:shrink">
              <PropertyCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
