import { dummyListings, type DummyListing } from "@/lib/dummyListings";
import { filterListings } from "./filterListings";

// Provider-agnostic interface (matches the original build brief §10 contract).
// Swapping IDX Broker / Spark API / any other MLS source in later is a
// contained change: implement this interface and swap the export at the
// bottom of this file. No component should import dummyListings directly.
export type Listing = DummyListing;

export type ListingFilters = {
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
};

export type ListingResult = {
  listings: Listing[];
  total: number;
};

export interface ListingProvider {
  search(filters: ListingFilters): Promise<ListingResult>;
  getById(id: string): Promise<Listing | null>;
  getRecent(count: number): Promise<Listing[]>;
  getRecentSince(hours: number): Promise<Listing[]>;
  getByNeighborhood(neighborhoodName: string): Promise<Listing[]>;
}

function byNewestFirst(a: Listing, b: Listing) {
  return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
}

// Backed by static dummy data until a real MLS/IDX feed is connected — see
// D1 for the provider decision and what's needed to swap this out.
class DummyListingProvider implements ListingProvider {
  async search(filters: ListingFilters): Promise<ListingResult> {
    const results = filterListings(dummyListings, filters);
    return { listings: results, total: results.length };
  }

  async getById(id: string): Promise<Listing | null> {
    return dummyListings.find((l) => l.id === id) ?? null;
  }

  async getRecent(count: number): Promise<Listing[]> {
    return [...dummyListings].sort(byNewestFirst).slice(0, count);
  }

  async getRecentSince(hours: number): Promise<Listing[]> {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return [...dummyListings]
      .filter((l) => new Date(l.listedAt).getTime() >= cutoff)
      .sort(byNewestFirst);
  }

  async getByNeighborhood(neighborhoodName: string): Promise<Listing[]> {
    return dummyListings
      .filter((l) => l.neighborhood === neighborhoodName)
      .sort(byNewestFirst);
  }
}

export const listingProvider: ListingProvider = new DummyListingProvider();
