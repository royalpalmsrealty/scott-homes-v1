"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { filterListings } from "@/lib/listings/filterListings";
import type { Listing } from "@/lib/listings/provider";
import { toListingFilters, type AiSearchFilters } from "@/lib/schemas/aiSearchFilters";

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function AISearchResults({
  query,
  initialFilters,
  initialResults,
  usedFallback,
  allListings,
}: {
  query: string;
  initialFilters: AiSearchFilters;
  initialResults: Listing[];
  usedFallback: boolean;
  allListings: Listing[];
}) {
  const [filters, setFilters] = useState(initialFilters);

  // Fallback (keyword) results have no filters to remove, so they stay
  // static; the AI-parsed path re-filters the full set as chips are removed.
  const results = useMemo(
    () => (usedFallback ? initialResults : filterListings(allListings, toListingFilters(filters))),
    [allListings, filters, usedFallback, initialResults]
  );

  const chips: { key: keyof AiSearchFilters; label: string }[] = [];
  if (filters.neighborhood) chips.push({ key: "neighborhood", label: filters.neighborhood });
  if (filters.minBeds) chips.push({ key: "minBeds", label: `${filters.minBeds}+ Beds` });
  if (filters.minPrice) chips.push({ key: "minPrice", label: `Min ${formatPrice(filters.minPrice)}` });
  if (filters.maxPrice) chips.push({ key: "maxPrice", label: `Max ${formatPrice(filters.maxPrice)}` });

  function removeChip(key: keyof AiSearchFilters) {
    setFilters((prev) => ({ ...prev, [key]: null }));
  }

  return (
    <div>
      <p className="font-sans text-sm text-muted">
        Showing results for &ldquo;{query}&rdquo;
      </p>

      {usedFallback ? (
        <p className="mt-2 max-w-xl font-sans text-sm text-gold-deep">
          We searched by keyword this time rather than parsing your phrase — the AI parser
          didn&rsquo;t come back with a confident read. Results below are a best-effort keyword
          match; try{" "}
          <Link href="/search" className="underline hover:no-underline">
            the full filter search
          </Link>{" "}
          for more control.
        </p>
      ) : chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Parsed search filters">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="flex items-center gap-2 border border-teal/40 bg-white px-3 py-1.5 font-sans text-sm text-teal-deep transition-colors hover:border-teal hover:bg-paper"
            >
              {chip.label}
              <span aria-hidden="true" className="text-xs">
                &times;
              </span>
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 font-sans text-sm text-muted">
          We didn&rsquo;t pick up any specific filters from that phrase — showing everything
          newest first.
        </p>
      )}

      {results.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            Nothing matches those filters right now. Try removing one above, or browse
            everything on the market.
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
  );
}
