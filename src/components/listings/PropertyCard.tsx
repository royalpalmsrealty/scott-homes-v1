import Image from "next/image";
import type { DummyListing } from "@/lib/dummyListings";

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US")}`;
}

export function PropertyCard({ listing }: { listing: DummyListing }) {
  return (
    <div className="flex h-full flex-col border border-line bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={listing.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {listing.status && (
          <span className="absolute left-3 top-3 inline-flex h-7 items-center bg-teal px-3 font-sans text-[11px] font-medium uppercase tracking-wide text-ink">
            {listing.status}
          </span>
        )}
        <span className="absolute bottom-2 right-3 bg-ink/60 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide text-white">
          Sample Photo
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-2xl text-gold">{formatPrice(listing.price)}</p>
        <p className="mt-1 font-sans text-sm text-ink">{listing.address}</p>
        <p className="font-sans text-xs text-muted">{listing.neighborhood}, Key West, FL</p>

        <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 font-sans text-xs text-body">
          <span>{listing.beds} Beds</span>
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          <span>{listing.baths} Baths</span>
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          <span>{listing.sqft.toLocaleString()} Sqft</span>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex min-h-11 items-center justify-center bg-teal px-4 py-2 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          Make an Offer
        </button>
      </div>
    </div>
  );
}
