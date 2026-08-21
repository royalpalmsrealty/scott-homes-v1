import Link from "next/link";
import Image from "next/image";
import type { ScrapedListing } from "@/lib/listings/idxScrape";
import { buildOwnListingUrl } from "@/lib/listings/idxScrape";

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function ScrapedListingCard({
  listing,
  backHref,
  backLabel,
}: {
  listing: ScrapedListing;
  /** Where this card's page would return to on "Back" — e.g. the
   * neighborhood or search results the card is shown under — so the detail
   * page can send the buyer back to where they actually were. */
  backHref?: string;
  backLabel?: string;
}) {
  const params = new URLSearchParams();
  if (backHref) params.set("from", backHref);
  if (backLabel) params.set("fromLabel", backLabel);
  const query = params.toString();
  const href = query ? `${buildOwnListingUrl(listing)}?${query}` : buildOwnListingUrl(listing);

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-paper">
        {listing.photoUrl ? (
          <Image
            src={listing.photoUrl}
            alt={listing.address}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--teal-deep)_0%,var(--ink)_100%)]">
            <span className="font-sans text-[11px] font-medium uppercase tracking-wide text-white/50">
              Photo Unavailable
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-teal-deep shadow-sm backdrop-blur">
          {listing.status}
        </span>
      </div>

      <div className="p-5">
        <p className="font-display text-lg text-ink transition-colors group-hover:text-teal-deep">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-1 font-sans text-sm text-body">{listing.address}</p>
        <p className="font-sans text-xs text-muted">{listing.city}</p>

        <div className="mt-3 flex items-center gap-3 font-sans text-xs text-muted">
          {listing.beds !== null && <span>{listing.beds} bd</span>}
          {listing.baths !== null && <span>{listing.baths} ba</span>}
          {listing.sqft !== null && <span>{listing.sqft.toLocaleString()} sqft</span>}
        </div>
      </div>
    </Link>
  );
}
