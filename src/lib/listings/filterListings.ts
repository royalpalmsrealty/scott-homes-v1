import type { Listing, ListingFilters } from "./provider";

// Pure, side-effect-free — safe to run on the server (inside the provider)
// or in the browser (re-filtering on chip removal without a round-trip).
// Once a real MLS feed replaces the dummy data, this stops being shipped to
// the client and the AI search results page should re-fetch instead.
export function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  let results = listings;

  if (filters.neighborhood) {
    results = results.filter((l) => l.neighborhood === filters.neighborhood);
  }
  if (filters.minPrice !== undefined) {
    results = results.filter((l) => l.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter((l) => l.price <= filters.maxPrice!);
  }
  if (filters.beds !== undefined) {
    results = results.filter((l) => l.beds >= filters.beds!);
  }

  return [...results].sort(
    (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
  );
}

// Last-resort fallback when AI parsing is unavailable/fails — matches the
// query against address and neighborhood text rather than returning nothing.
export function keywordSearchListings(listings: Listing[], query: string): Listing[] {
  const needle = query.toLowerCase();
  const results = listings.filter(
    (l) =>
      l.address.toLowerCase().includes(needle) ||
      l.neighborhood.toLowerCase().includes(needle)
  );
  return results.length > 0 ? results : listings;
}
