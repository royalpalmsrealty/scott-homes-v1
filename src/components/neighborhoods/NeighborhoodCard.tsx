import Link from "next/link";
import { NeighborhoodPhoto } from "./NeighborhoodPhoto";
import type { Neighborhood } from "@/lib/neighborhoods";
import { dummyListings } from "@/lib/dummyListings";

export function NeighborhoodCard({
  neighborhood,
  aspectClassName = "aspect-[4/5]",
  priority = false,
}: {
  neighborhood: Neighborhood;
  aspectClassName?: string;
  priority?: boolean;
}) {
  const activeCount = dummyListings.filter((l) => l.neighborhood === neighborhood.name).length;

  return (
    <Link
      href={`/neighborhoods/${neighborhood.slug}`}
      className="group relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
    >
      <NeighborhoodPhoto
        name={neighborhood.name}
        image={neighborhood.image}
        imageAlt={neighborhood.imageAlt}
        priority={priority}
        className={`${aspectClassName} transition-transform duration-[400ms] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
      />
      {/* Ink overlay: 65% at the bottom, fading to transparent by 45% height (R6). */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 45%)" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="font-display text-xl text-white sm:text-2xl">{neighborhood.name}</p>
        <p className="mt-1 font-sans text-sm font-medium text-gold">
          {activeCount > 0
            ? `${activeCount} Active Listing${activeCount > 1 ? "s" : ""}`
            : "No Active Listings"}
        </p>
      </div>
    </Link>
  );
}
