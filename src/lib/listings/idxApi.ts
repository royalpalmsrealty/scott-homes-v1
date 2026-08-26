// IDX Broker's real, authenticated REST API — distinct from idxScrape.ts,
// which parses IDX Broker's public HTML pages because there was no API key
// on this account. That HTML-scraping approach is what's been getting
// intermittently 403'd by IDX Broker's own bot protection when run from
// Vercel (see idxScrape.ts's fetchIdxPage comment).
//
// IMPORTANT — this API is NOT a full replacement for that scraper. Per IDX
// Broker's own developer docs ("Connecting to the API", checked 2026-08-26),
// it explicitly does NOT provide MLS-wide search, MLS-wide property details,
// or property retrieval by MLS ID — an MLS-compliance restriction, not a gap
// they forgot to fill. The only listing data available here is Featured
// Listings and listings belonging to the account's own agent(s). So this
// file only covers /featured — /search, /neighborhoods/[slug], and /sold
// still have to go through idxScrape.ts's HTML scraping; there's no API
// alternative for those.
import type { ScrapedListing } from "./idxScrape";

export function isIdxApiConfigured() {
  return Boolean(process.env.IDX_BROKER_API_KEY);
}

const FEATURED_API_URL = "https://api.idxbroker.com/clients/featured";

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// The docs don't publish a full sample response for this endpoint (unlike
// /leads/lead, which does) — only a table of "common fields". This mapper is
// written from that table plus the PHP example's field access, and is
// intentionally defensive (every field optional-chained, numbers parsed
// leniently) since the exact shape hasn't been verified against a live
// response yet. Re-check this against a real payload once IDX_BROKER_API_KEY
// is set, and tighten it up if anything doesn't match.
function mapFeaturedListing(raw: Record<string, unknown>): ScrapedListing | null {
  const detailsUrl = typeof raw.fullDetailsURL === "string" ? raw.fullDetailsURL : "";
  // Same URL shape idxScrape.ts's own scraper already parses:
  // /idx/details/listing/<mlsId>/<listingId>/<addressSlug>
  const match = detailsUrl.match(/\/idx\/details\/listing\/([^/]+)\/([^/]+)\/([^/?#]+)/);
  const mlsId = match?.[1];
  const listingId = match?.[2];
  const addressSlug = match?.[3];
  if (!mlsId || !listingId || !addressSlug) return null;

  const images = Array.isArray(raw.image) ? raw.image : [];
  const photoUrl =
    images.length > 0 && typeof images[0] === "object" && images[0] !== null
      ? ((images[0] as Record<string, unknown>).url as string | undefined) ?? null
      : null;

  return {
    listingId,
    mlsId,
    addressSlug,
    address: typeof raw.address === "string" ? raw.address : "",
    // The docs' field table doesn't list separate city/state/zip fields for
    // this endpoint (only `address`) — leaving blank rather than guessing at
    // a field name that might not exist. Revisit once a real response shows
    // whether IDX Broker includes them under a different key.
    city: "",
    price: parseNumber(raw.listingPrice) ?? 0,
    beds: parseNumber(raw.bedrooms),
    baths: parseNumber(raw.totalBaths),
    sqft: parseNumber(raw.sqFt ?? raw.totalSqFt),
    photoUrl,
    // Featured listings are, by definition, active — the endpoint doesn't
    // return sold/pending inventory.
    status: "active",
    description: typeof raw.remarksConcat === "string" ? raw.remarksConcat : "",
    lat: parseNumber(raw.latitude),
    lng: parseNumber(raw.longitude),
  };
}

export async function fetchFeaturedListingsViaApi(perPage = 24): Promise<ScrapedListing[]> {
  const apiKey = process.env.IDX_BROKER_API_KEY;
  if (!apiKey) throw new Error("IDX_BROKER_API_KEY is not configured");

  // Featured listings don't change minute-to-minute, and the API's own rate
  // limit is tight (300-500 requests/hour, per IDX Broker's docs) — caching
  // this for 5 minutes matches their own explicit guidance ("API calls
  // should not occur on every page load").
  const res = await fetch(FEATURED_API_URL, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accesskey: apiKey,
      outputtype: "json",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`IDX Broker API featured-listings request failed: ${res.status}`);
  }

  const json = await res.json();
  // The docs' PHP example iterates the decoded response with foreach ($listings
  // as $key => $value) — consistent with either a JSON array or a JSON object
  // keyed by listing ID. Handle both rather than assume one.
  const items: unknown[] = Array.isArray(json) ? json : Object.values(json ?? {});

  return items
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map(mapFeaturedListing)
    .filter((listing): listing is ScrapedListing => listing !== null)
    .slice(0, perPage);
}
