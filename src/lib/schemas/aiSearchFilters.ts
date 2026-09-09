import { z } from "zod";
import { neighborhoods } from "@/lib/neighborhoods";

const validNeighborhoodNames = neighborhoods.map((n) => n.name);

// Deliberately limited to fields IdxSearchFilters (src/lib/listings/idxSearch.ts)
// can actually filter on (neighborhood, price, beds). Adding fields like
// "transient license" to this schema without a real MLS field to back them
// would produce chips that don't do anything — worse than not asking.
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
