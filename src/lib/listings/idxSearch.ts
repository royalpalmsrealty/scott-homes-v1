// Maps our own AI-parsed search filters onto IDX Broker's actual hosted
// results page (search.royalpalmsrealty.com) — discovered by inspecting the
// live Advanced Search form's field names (idxID, pt, lp, hp, bd), since the
// raw JSON listing API isn't usable on this account (see project notes).
//
// IMPORTANT (fixed 2026-08-20): geography is NOT submitted as "ccz" despite
// that being the visible field's name — "ccz" is only an internal tracker
// the page's own JS uses to remember which type (city/county/zipcode) is
// selected. The advanced-search form's inline script renames the actual
// select's submitted field to "city[]" / "county[]" / "zipcode[]" on change
// (see idx('#IDX-ccz-select').attr('name', ...)). Passing "ccz=<id>" directly
// is silently ignored.
const IDX_BASE_URL = "https://search.royalpalmsrealty.com/idx/results/listings";
const IDX_ID = "b066"; // Florida Keys MLS, per mls/approvedmls

// CORRECTED 2026-08-24 (client-verified): the real per-neighborhood field is
// a_locationTaxLegalKwNeighborhood[] — not exposed on the public search/
// advanced-search forms (an earlier pass through this project only found
// a_propStatus/a_propSubType there), but confirmed live by the client
// directly against the results endpoint. Client-confirmed values: "Casa
// Marina", "Sunset Key", and Old Town as the combination of "Old Town-N of
// Truman" + "Old Town-S of Truman" (verified live: excludes Sunset Key
// entirely). The remaining values below (Truman Annex, Midtown East,
// Midtown West, New Town, The Meadows) were found by testing the exact
// neighborhood name against this same field and confirming a real,
// non-zero, geographically plausible result (e.g. Truman Annex's returned
// listings sit at ~24.55,-81.807 — the real Truman Annex peninsula).
//
const NEIGHBORHOOD_TO_KW_VALUES: Record<string, string[]> = {
  "Casa Marina": ["Casa Marina"],
  "Old Town": ["Old Town-N of Truman", "Old Town-S of Truman"],
  "Sunset Key": ["Sunset Key"],
  "Truman Annex": ["Truman Annex"],
  "Midtown East": ["Midtown East"],
  "Midtown West": ["Midtown West"],
  "New Town": ["New Town"],
  "The Meadows": ["The Meadows"],
};

// "Shark Key" and "Key Haven" have no known a_locationTaxLegalKwNeighborhood[]
// value (plausible guesses — plain name, "... Estates", hyphenated forms —
// all returned zero results), but IDX Broker Saved Links found in the
// account's own /idx/linkshowcase directory cover both. Verified live
// 2026-08-24:
//   - Shark Key (/i/shark-key-property-listings): 5 results, all genuinely
//     Shark Key addresses (Cannon Royal Drive, Sea Lore Lane), zero Sunset
//     Key bleed-through.
//   - Key Haven (/i/Key_Haven): 6 results.
// Both accept the same query-string filters as the main results endpoint
// appended directly to them (confirmed for Shark Key: appending lp=8000000
// correctly dropped 5 results to 2) — so this uses a different base URL than
// IDX_BASE_URL but the same filter params; buildIdxSearchUrl below picks
// whichever base URL applies.
//
// NOTE: most of the other links in /idx/linkshowcase are NOT reliable for
// this purpose — checked 2026-08-24 and the ones for Sunset Key, Midtown
// East, Midtown West, New Town, and The Meadows all silently return the
// entire ~500-listing unfiltered board (IDX-totalResults-500) rather than a
// real filtered result, and the "old-town-key-west-listings" one is a
// narrower/stale saved search, not the true neighborhood boundary. Do not
// swap any of NEIGHBORHOOD_TO_KW_VALUES over to a linkshowcase link without
// verifying it the same way (check the result count isn't 500, and spot
// check individual listing addresses/coordinates are actually in that
// neighborhood).
const NEIGHBORHOOD_TO_SAVED_LINK: Record<string, string> = {
  "Shark Key": "https://search.royalpalmsrealty.com/i/shark-key-property-listings",
  "Key Haven": "https://search.royalpalmsrealty.com/i/Key_Haven",
};

export type NeighborhoodFilterStatus =
  | { available: true; mode: "kwValues"; kwValues: string[] }
  | { available: true; mode: "savedLink"; baseUrl: string }
  | { available: false };

export function getNeighborhoodFilterStatus(neighborhoodName: string): NeighborhoodFilterStatus {
  const savedLink = NEIGHBORHOOD_TO_SAVED_LINK[neighborhoodName];
  if (savedLink) return { available: true, mode: "savedLink", baseUrl: savedLink };
  const kwValues = NEIGHBORHOOD_TO_KW_VALUES[neighborhoodName];
  if (!kwValues) return { available: false };
  return { available: true, mode: "kwValues", kwValues };
}

export type IdxSearchFilters = {
  // Only ever pass a neighborhood here once the caller has already checked
  // getNeighborhoodFilterStatus(...).available — this function does not
  // fall back to an unfiltered/citywide search if it can't resolve one.
  neighborhood?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minBeds?: number | null;
  // Confirmed against live MLS data (2026-08-20): a_propSubType[]=Condominium
  // and a_waterfrontYN=Y both genuinely narrow results — verified by
  // inspecting individual returned listings' actual property type, not just
  // result counts (page-size capping made count-only comparison unreliable).
  condo?: boolean;
  waterfront?: boolean;
  // Maps to the results page's own "srt" sort field (confirmed live via its
  // #IDX-refineSorting select) — the only "recency" signal IDX exposes.
  // There's no actual list-date attribute anywhere in the scraped markup,
  // so this can order by newest-first but can't answer "listed in the last
  // N hours" precisely — see the "New Listings" pages for how that's handled.
  sort?: "newest";
};

export function buildIdxSearchUrl(filters: IdxSearchFilters): string {
  const params = new URLSearchParams();
  params.set("idxID", IDX_ID);
  params.set("pt", "1"); // Residential — the default intent for a home-buyer search
  // Strips IDX Broker's own wrapper (the old WordPress site's header/sidebar,
  // still assigned to this account's pages) — confirmed live 2026-08-26 via
  // their own troubleshooting doc's "?nowrapper" trick. Without this, our
  // <iframe> embeds show a second, unrelated site chrome nested inside ours.
  params.set("nowrapper", "1");

  if (filters.minPrice) params.set("lp", String(filters.minPrice));
  if (filters.maxPrice) params.set("hp", String(filters.maxPrice));
  if (filters.minBeds) params.set("bd", String(filters.minBeds));
  if (filters.condo) params.append("a_propSubType[]", "Condominium");
  if (filters.waterfront) params.set("a_waterfrontYN", "Y");
  if (filters.sort === "newest") params.set("srt", "newest");

  // No fallback: if the neighborhood doesn't resolve to a real KW
  // Neighborhood value or saved link, no geography filter is applied at all
  // rather than silently substituting all of Key West. Callers must check
  // getNeighborhoodFilterStatus first and skip fetching entirely when
  // unavailable — see the neighborhood pages.
  const status = filters.neighborhood ? getNeighborhoodFilterStatus(filters.neighborhood) : null;
  let baseUrl: string = IDX_BASE_URL;
  if (status?.available) {
    if (status.mode === "savedLink") {
      // Shark Key (and any future saved-link-only neighborhood): a
      // pre-isolated IDX Broker Saved Link stands in for both the base URL
      // and the idxID/pt params, but still takes the same lp/hp/bd/etc.
      // params appended above — confirmed live (see NEIGHBORHOOD_TO_SAVED_LINK).
      baseUrl = status.baseUrl;
      params.delete("idxID");
      params.delete("pt");
    } else {
      for (const value of status.kwValues) {
        params.append("a_locationTaxLegalKwNeighborhood[]", value);
      }
    }
  }

  return `${baseUrl}?${params.toString()}`;
}
