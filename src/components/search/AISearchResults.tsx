"use client";

import { useEffect, useState } from "react";
import type { ScrapedListing } from "@/lib/listings/idxScrape";
import { ScrapedListingCard } from "@/components/listings/ScrapedListingCard";
import type { AiSearchFilters } from "@/lib/schemas/aiSearchFilters";

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function AISearchResults({
  query,
  initialFilters,
  usedFallback,
}: {
  query: string;
  initialFilters: AiSearchFilters;
  usedFallback: boolean;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [listings, setListings] = useState<ScrapedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [neighborhoodUnavailable, setNeighborhoodUnavailable] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
    if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    if (filters.minBeds) params.set("minBeds", String(filters.minBeds));

    setLoading(true);
    setError(null);
    setNeighborhoodUnavailable(false);
    fetch(`/api/listings/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.neighborhoodUnavailable) {
          setNeighborhoodUnavailable(true);
          setListings([]);
          return;
        }
        if (data.error) throw new Error(data.error);
        setListings(data.listings ?? []);
      })
      .catch(() => setError("Couldn't load live listings right now. Try again in a moment."))
      .finally(() => setLoading(false));
  }, [filters]);

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
      <p className="font-sans text-sm text-muted">Showing results for &ldquo;{query}&rdquo;</p>

      {usedFallback ? (
        <p className="mt-2 max-w-xl font-sans text-sm text-gold-deep">
          We couldn&rsquo;t confidently parse that phrase into filters — showing everything on the
          market instead. Try rephrasing your search.
        </p>
      ) : chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Parsed search filters">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="flex items-center gap-2 rounded-full border border-teal/40 bg-white px-3 py-1.5 font-sans text-sm text-teal-deep transition-colors hover:border-teal hover:bg-paper"
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
          We didn&rsquo;t pick up any specific filters from that phrase — showing everything on
          the market.
        </p>
      )}


      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[340px] animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      ) : neighborhoodUnavailable ? (
        <div className="mt-10 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            Live MLS search can&rsquo;t currently be narrowed to &ldquo;{filters.neighborhood}
            &rdquo; specifically — IDX Broker&rsquo;s public search for this account doesn&rsquo;t
            expose that level of neighborhood detail, so we&rsquo;re not showing unrelated Key West
            listings here instead.
          </p>
        </div>
      ) : error ? (
        <p className="mt-10 font-sans text-sm text-gold-deep">{error}</p>
      ) : listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="font-sans text-base text-body">
            Nothing matches those filters right now. Try removing one above.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ScrapedListingCard
              key={listing.listingId}
              listing={listing}
              backHref="/"
              backLabel="Back to Home"
            />
          ))}
        </div>
      )}

      <p className="mt-8 font-sans text-xs text-muted">
        Results sourced live from the Florida Keys MLS via IDX Broker.
      </p>
    </div>
  );
}
