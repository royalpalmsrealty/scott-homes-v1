import { z } from "zod";
import { neighborhoods } from "@/lib/neighborhoods";
import type { ListingFilters } from "@/lib/listings/provider";

const validNeighborhoodNames = neighborhoods.map((n) => n.name);

// Deliberately limited to fields the dummy listing data can actually filter
// on (neighborhood, price, beds). Adding fields like "waterfront" or
// "transient license" to this schema without real MLS attributes to back
// them would produce chips that don't do anything — worse than not asking.
export const AiSearchFiltersSchema = z.object({
  neighborhood: z.enum(validNeighborhoodNames as [string, ...string[]]).nullable(),
  minPrice: z.number().positive().nullable(),
  maxPrice: z.number().positive().nullable(),
  minBeds: z.number().int().min(0).max(10).nullable(),
});

export type AiSearchFilters = z.infer<typeof AiSearchFiltersSchema>;

export const emptyFilters: AiSearchFilters = {
  neighborhood: null,
  minPrice: null,
  maxPrice: null,
  minBeds: null,
};

// AiSearchFilters uses null (a field the AI explicitly considered and found
// absent); ListingFilters uses undefined (the provider's "not filtering on
// this" convention) — this is the one conversion point between the two.
export function toListingFilters(filters: AiSearchFilters): ListingFilters {
  return {
    neighborhood: filters.neighborhood ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    beds: filters.minBeds ?? undefined,
  };
}
