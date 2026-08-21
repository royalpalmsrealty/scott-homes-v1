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
// is silently ignored — confirmed live: it returned the entire unfiltered
// board (Marathon, Islamorada, Plantation Key included) instead of Shark
// Key. "city[]=<id>" was verified to actually restrict results (Shark Key
// alone: 6 real matches, addressed to Shark Key/Sunset Key; Key West alone:
// 283, addressed to Key West/Key Haven). This also means neighborhood
// filtering in the AI search feature (built earlier the same day) was
// silently non-functional until this fix.
const IDX_BASE_URL = "https://search.royalpalmsrealty.com/idx/results/listings";
const IDX_ID = "b066"; // Florida Keys MLS, per mls/approvedmls

// IDX's own geography only goes down to "island" level (its ccz field), not
// Key West's individual neighborhoods — Shark Key happens to be its own
// island so it maps directly; everything else on our neighborhoods page is
// a sub-area of Key West island itself, so those all broaden to the same
// Key West city ID rather than something more specific IDX can't express.
const NEIGHBORHOOD_TO_CITY_ID: Record<string, string> = {
  "Shark Key": "54150",
};
const KEY_WEST_CITY_ID = "24130";

export type IdxSearchFilters = {
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
};

export function buildIdxSearchUrl(filters: IdxSearchFilters): string {
  const params = new URLSearchParams();
  params.set("idxID", IDX_ID);
  params.set("pt", "1"); // Residential — the default intent for a home-buyer search

  if (filters.minPrice) params.set("lp", String(filters.minPrice));
  if (filters.maxPrice) params.set("hp", String(filters.maxPrice));
  if (filters.minBeds) params.set("bd", String(filters.minBeds));
  if (filters.condo) params.append("a_propSubType[]", "Condominium");
  if (filters.waterfront) params.set("a_waterfrontYN", "Y");

  const cityId = filters.neighborhood
    ? NEIGHBORHOOD_TO_CITY_ID[filters.neighborhood] ?? KEY_WEST_CITY_ID
    : undefined;
  if (cityId) params.set("city[]", cityId);

  return `${IDX_BASE_URL}?${params.toString()}`;
}

export function getNeighborhoodCityId(neighborhoodName: string): string {
  return NEIGHBORHOOD_TO_CITY_ID[neighborhoodName] ?? KEY_WEST_CITY_ID;
}

// True when the requested neighborhood had to be broadened to all of Key
// West because IDX doesn't expose that level of geographic granularity —
// used to show an honest note instead of silently over-promising precision.
export function neighborhoodWasBroadened(neighborhood?: string | null): boolean {
  return Boolean(neighborhood) && !NEIGHBORHOOD_TO_CITY_ID[neighborhood!];
}
