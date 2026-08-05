import Link from "next/link";
import { NeighborhoodPhoto } from "./NeighborhoodPhoto";
import type { Neighborhood } from "@/lib/neighborhoods";
import { dummyListings } from "@/lib/dummyListings";

export function NeighborhoodCard({ neighborhood }: { neighborhood: Neighborhood }) {
  const activeCount = dummyListings.filter((l) => l.neighborhood === neighborhood.name).length;

  return (
    <Link
      href={`/neighborhoods/${neighborhood.slug}`}
      className="group block border border-line bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
    >
      <div className="overflow-hidden">
        <NeighborhoodPhoto
          name={neighborhood.name}
          className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="p-5">
        <p className="font-display text-xl text-ink">{neighborhood.name}</p>
        <p className="mt-1 font-sans text-sm text-muted">{neighborhood.tileBlurb}</p>
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 font-sans text-xs text-body">
          <span>
            {activeCount > 0 ? `${activeCount} Active Listing${activeCount > 1 ? "s" : ""}` : "No Active Listings"}
          </span>
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          <span>Median ${neighborhood.medianPrice.toLocaleString("en-US")}</span>
        </div>
      </div>
    </Link>
  );
}
