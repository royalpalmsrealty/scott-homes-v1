import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrapedListingCard } from "@/components/listings/ScrapedListingCard";
import type { ScrapedListing } from "@/lib/listings/idxScrape";

export function QuickSearchResults({
  heading,
  intro,
  listings,
  backHref,
  backLabel,
}: {
  heading: string;
  intro: string;
  listings: ScrapedListing[];
  backHref: string;
  backLabel: string;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Key West Listings" heading={heading} as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">{intro}</p>

      {listings.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ScrapedListingCard
              key={listing.listingId}
              listing={listing}
              backHref={backHref}
              backLabel={backLabel}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            Nothing to show right now — check back soon, or browse everything currently on the
            market.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
          >
            Search All Key West Listings
          </Link>
        </div>
      )}

      <p className="mt-8 font-sans text-xs text-muted">
        Results sourced live from the Florida Keys MLS via IDX Broker, sorted newest first.
      </p>
    </section>
  );
}
