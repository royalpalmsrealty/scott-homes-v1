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
      className="group relative block overflow-hidden rounded-2xl ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(40,188,184,0.3)] hover:ring-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
    >
      <NeighborhoodPhoto
        name={neighborhood.name}
        image={neighborhood.image}
        imageAlt={neighborhood.imageAlt}
        priority={priority}
        className={`${aspectClassName} transition-transform duration-[400ms] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
      />
      {/* Ink overlay: 65% at the bottom, fading to transparent by 45% height (R6). */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.15) 100%)" }}
      />

      {/* Median price badge — top corner, so a scan of the grid gives a price sense at a glance. */}
      <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 font-sans text-xs font-medium text-white backdrop-blur-md">
        From ${(neighborhood.medianPrice / 1000).toFixed(0)}K
      </span>

      {/* "Explore" reveal — fades in on hover as a soft nudge that the card is clickable. */}
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
        <ArrowIcon />
      </span>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="font-display text-xl text-white sm:text-2xl">{neighborhood.name}</p>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-medium backdrop-blur-md ${
            activeCount > 0 ? "bg-teal/25 text-white" : "bg-white/15 text-white/80"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${activeCount > 0 ? "bg-teal" : "bg-white/50"}`}
            aria-hidden="true"
          />
          {activeCount > 0
            ? `${activeCount} Active Listing${activeCount > 1 ? "s" : ""}`
            : "No Active Listings"}
        </span>
      </div>
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
