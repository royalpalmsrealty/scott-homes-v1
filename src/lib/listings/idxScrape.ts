import * as cheerio from "cheerio";
import { buildIdxSearchUrl, type IdxSearchFilters } from "./idxSearch";

// Client-reported bug fix (2026-08-26): listings would intermittently vanish
// on refresh/page-change with no visible error. Root-caused live (via Vercel
// function logs) to IDX Broker's own WAF returning a 403 for some requests —
// confirmed the exact same URL succeeds every time from a non-Vercel IP, so
// this is IDX Broker rate/bot-limiting Vercel's outbound IPs specifically,
// not a bug in our fetch logic. Not something fixable by changing what we
// send — the two real mitigations are (1) retry the 403/429/5xx cases, since
// they're transient, and (2) fall back to the last successful response for
// that same query if every attempt fails, rather than showing a false "0
// results." cache: "no-store" is still set so a *successful* request is
// always fresh, never Next.js's own stale Data Cache.
async function fetchIdxPage(url: string, timeoutMs = 12000): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      const transient = res.status === 403 || res.status === 429 || res.status >= 500;
      if (res.ok || !transient) return res;
      lastError = new Error(`IDX Broker responded ${res.status} for ${url}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }
  console.error("IDX Broker fetch failed after retries:", lastError);
  throw lastError instanceof Error ? lastError : new Error("IDX Broker fetch failed");
}

// Per-serverless-instance memory of the last successful HTML for a given
// URL — not a real cache (nothing is ever served from here instead of a
// fresh fetch), it's a fallback of last resort for when every live attempt
// above fails, so a transient IDX Broker block shows slightly-stale real
// data instead of a false "0 results" or a hard error. 20 minutes is long
// enough to absorb a blocked-IP window but short enough that a buyer never
// sees meaningfully outdated inventory.
const STALE_FALLBACK_MS = 20 * 60 * 1000;
const lastGoodHtml = new Map<string, { html: string; savedAt: number }>();

async function fetchIdxHtml(url: string): Promise<string> {
  try {
    const res = await fetchIdxPage(url);
    if (!res.ok) throw new Error(`IDX Broker responded ${res.status} for ${url}`);
    const html = await res.text();
    lastGoodHtml.set(url, { html, savedAt: Date.now() });
    return html;
  } catch (err) {
    const cached = lastGoodHtml.get(url);
    if (cached && Date.now() - cached.savedAt < STALE_FALLBACK_MS) {
      console.error(`IDX Broker fetch failed, serving ${Math.round((Date.now() - cached.savedAt) / 1000)}s-old fallback for ${url}`, err);
      return cached.html;
    }
    throw err;
  }
}

// IDX Broker's raw API can't return general MLS search results on this
// account's plan (see project notes) — but the hosted results page they
// already serve for embedding contains the same data as structured HTML
// (data-* attributes on each result cell), so this parses that instead of
// re-deriving anything IDX Broker doesn't otherwise expose.
export type ScrapedListing = {
  listingId: string;
  mlsId: string;
  addressSlug: string;
  address: string;
  city: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  photoUrl: string | null;
  status: string;
  description: string;
  lat: number | null;
  lng: number | null;
};

function detailPath(mlsId: string, listingId: string, addressSlug: string) {
  return `/idx/details/listing/${mlsId}/${listingId}/${addressSlug}`;
}

export function buildOwnListingUrl(listing: Pick<ScrapedListing, "listingId" | "addressSlug">): string {
  return `/listings/${listing.listingId}-${listing.addressSlug}`;
}

export function parseOwnListingSlug(slug: string): { listingId: string; addressSlug: string } | null {
  const match = slug.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  return { listingId: match[1], addressSlug: match[2] };
}

export function buildIdxDetailUrl(listingId: string, addressSlug: string, mlsId = "b066"): string {
  return `https://search.royalpalmsrealty.com${detailPath(mlsId, listingId, addressSlug)}`;
}

export type ListingDetail = {
  listingId: string;
  mlsId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  status: string;
  beds: number | null;
  fullBaths: number | null;
  partialBaths: number | null;
  totalBaths: number | null;
  sqft: number | null;
  acres: number | null;
  yearBuilt: number | null;
  description: string;
  photos: string[];
  lat: number | null;
  lng: number | null;
  // MLS rules require this attribution to display alongside the listing —
  // never drop it, it's not just cosmetic.
  listedBy: string;
};

function findSummaryField($: cheerio.CheerioAPI, label: string): string | undefined {
  let value: string | undefined;
  $(".IDX-summaryField").each((_, el) => {
    // Labels render with a trailing colon ("Bedrooms:") — strip it before
    // comparing, or every lookup here silently fails and the stat gets
    // dropped from the page instead of shown.
    const fieldLabel = $(el).find(".IDX-summaryFieldLabel").text().trim().replace(/:$/, "");
    if (fieldLabel.toLowerCase() === label.toLowerCase()) {
      value = $(el).find(".IDX-summaryFieldData").text().trim();
    }
  });
  return value;
}

export async function fetchListingDetail(listingId: string, addressSlug: string): Promise<ListingDetail | null> {
  const mlsId = "b066";
  const detailUrl = buildIdxDetailUrl(listingId, addressSlug, mlsId);
  const galleryUrl = `https://search.royalpalmsrealty.com/idx/photogallery/${mlsId}/${listingId}`;

  const [detailRes, galleryRes] = await Promise.all([
    fetchIdxPage(detailUrl),
    fetchIdxPage(galleryUrl).catch(() => null),
  ]);
  if (!detailRes.ok) return null;

  const $ = cheerio.load(await detailRes.text());

  const number = $(".IDX-detailsAddressNumber").first().text().trim();
  const street = $(".IDX-detailsAddressName").first().text().trim();
  if (!number && !street) return null; // page rendered but no listing at this ID (removed/expired)

  const html = $.html();
  const lat = html.match(/data-lat="([^"]*)"/)?.[1];
  const lng = html.match(/data-lng="([^"]*)"/)?.[1];
  // Fallback only — the "Status:" summary field itself is normally reliable
  // (confirmed live for both active and sold listings), this just covers
  // the rare case it's missing. Case-insensitive: cheerio lowercases
  // attribute names when it re-serializes the parsed DOM, so the raw server
  // HTML's "data-idxStatus" comes back out as "data-idxstatus" here.
  const idxStatusAttr = html.match(/data-idxstatus="([^"]*)"/i)?.[1];
  // A sold/closed listing's own "Status:" field reads "Closed" (matches the
  // account's admin dashboard, which also labels these CLOSED) — normalize
  // to "Sold" for buyer-facing display, since that's what the rest of the
  // site's copy and the /sold page use.
  function normalizeStatus(raw: string | undefined): string | undefined {
    if (!raw) return raw;
    return raw.toLowerCase() === "closed" ? "Sold" : raw;
  }

  let photos: string[] = [];
  if (galleryRes?.ok) {
    const galleryHtml = await galleryRes.text();
    const matches = galleryHtml.match(/https:\/\/cdn\.photos\.sparkplatform\.com\/[a-zA-Z0-9/_.-]+/g) ?? [];
    photos = [...new Set(matches)];
  }
  const coverPhoto = $(".IDX-detailsPhoto img, .IDX-detailsPhotoWrap img").first().attr("src");
  if (photos.length === 0 && coverPhoto) photos = [coverPhoto];

  return {
    listingId,
    mlsId,
    address: `${number} ${street}`.trim(),
    city: $(".IDX-detailsAddressCity").first().text().trim(),
    state: $(".IDX-detailsAddressStateAbrv").first().text().trim(),
    zip: $(".IDX-detailsAddressZipcode").first().text().trim(),
    price: parseNumber($(".IDX-detailsPrice").first().text()) ?? 0,
    status:
      normalizeStatus(findSummaryField($, "Status")) ||
      normalizeStatus(idxStatusAttr ? idxStatusAttr.charAt(0).toUpperCase() + idxStatusAttr.slice(1) : undefined) ||
      "Active",
    beds: parseNumber(findSummaryField($, "Bedrooms")),
    fullBaths: parseNumber(findSummaryField($, "Full Baths")),
    partialBaths: parseNumber(findSummaryField($, "Partial Baths")),
    totalBaths: parseNumber(findSummaryField($, "Total Baths")),
    sqft: parseNumber(findSummaryField($, "SqFt")),
    acres: parseNumber(findSummaryField($, "Acres")),
    yearBuilt: parseNumber(findSummaryField($, "Year Built")),
    // The raw MLS text sometimes has no space after a sentence's period
    // ("...intention.Hop on...") — add one back before collapsing whitespace,
    // without touching real content.
    description: $("#IDX-detailsDescription")
      .first()
      .text()
      .replace(/\.([A-Z])/g, ". $1")
      .replace(/\s+/g, " ")
      .trim(),
    photos,
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
    listedBy: $(".IDX-mlsSelectorRulesCourtesy").first().text().replace(/\s+/g, " ").trim(),
  };
}

function parseNumber(text: string | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// parseNumber strips "-" along with currency symbols/commas — fine for
// prices/beds/baths (always positive) but wrong for longitude, which is
// always negative here (Key West sits west of the prime meridian).
function parseCoord(text: string | undefined): number | null {
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export type IdxResultsCount = { count: number; isMinimum: boolean };

// The authoritative match total — separate from ScrapedListing rows, which
// are capped at whatever `per` was requested for pagination. Confirmed live
// (2026-08-20) that these genuinely diverge: an unfiltered Key West search
// reports 500 (IDX's own display ceiling) while a Condo-filtered one reports
// 202 — counting scraped rows instead would show the same number for both
// once both exceed the requested page size, silently hiding that the filter
// worked. isMinimum is true when IDX's own "more than the maximum number of
// listings" message appears, meaning the true count exceeds what's shown.
export async function fetchIdxResultsCount(filters: IdxSearchFilters): Promise<IdxResultsCount> {
  const url = new URL(buildIdxSearchUrl(filters));
  url.searchParams.set("per", "1");

  // Was silently returning {count: 0} on any non-200, indistinguishable from
  // a genuine zero-result search — fixed 2026-08-26 to throw like every
  // other fetch here, so callers can show a real "couldn't load" state
  // instead of a false "no listings" one.
  const html = await fetchIdxHtml(url.toString());
  const $ = cheerio.load(html);
  const countText = $(".IDX-resultsCount").first().text().trim();
  const count = parseInt(countText.replace(/[^0-9]/g, ""), 10) || 0;
  const isMinimum = $("#IDX-resultsCountMessage").text().includes("more than the maximum");

  return { count, isMinimum };
}

function parseResultsCells($: cheerio.CheerioAPI): ScrapedListing[] {
  const listings: ScrapedListing[] = [];

  $(".IDX-resultsCell").each((_, el) => {
    const cell = $(el);
    const listingId = cell.attr("data-listingid");
    const mlsId = cell.attr("data-idxid");
    if (!listingId || !mlsId) return;

    const addressLink = cell.find(".IDX-resultsAddressLink").first();
    const hrefMatch = addressLink.attr("href")?.match(/\/idx\/details\/listing\/[^/]+\/[^/]+\/([^/?#]+)/);
    const addressSlug = hrefMatch?.[1];
    if (!addressSlug) return;

    const number = cell.find(".IDX-resultsAddressNumber").first().text().trim();
    const street = cell.find(".IDX-resultsAddressName").first().text().trim();
    const city = cell.find(".IDX-resultsAddressCity").first().text().trim();
    const state = cell.find(".IDX-resultsAddressStateAbrv").first().text().trim();
    const zip = cell.find(".IDX-resultsAddressZip").first().text().trim();

    listings.push({
      listingId,
      mlsId,
      addressSlug,
      address: `${number} ${street}`.trim(),
      city: `${city}, ${state} ${zip}`.trim(),
      // On the sold/pending page this is the actual sold price, not a list
      // price — confirmed live against the account's own admin listing
      // (605503 / 41 Cannon Royal Drive: data-price="3700000" matches its
      // "Sold For: $3,700,000" detail-page label exactly).
      price: parseNumber(cell.attr("data-price")) ?? 0,
      beds: parseNumber(cell.find(".IDX-resultsField-bedrooms .IDX-resultsText").first().text()),
      baths: parseNumber(cell.find(".IDX-resultsField-totalBaths .IDX-resultsText").first().text()),
      sqft: parseNumber(cell.find(".IDX-resultsField-sqFt .IDX-resultsText").first().text()),
      photoUrl: cell.find(".IDX-resultsPhotoImg").first().attr("src") ?? null,
      status: cell.attr("data-idxstatus") ?? "active",
      description: cell.find(".IDX-resultsDescription").first().text().trim(),
      lat: parseCoord(cell.attr("data-lat")),
      lng: parseCoord(cell.attr("data-lng")),
    });
  });

  return listings;
}

// `start` is IDX Broker's own pagination offset (confirmed live 2026-08-26:
// ?start=24&per=24 returns the next 24 rows after ?start=0/omitted) — pass
// (page - 1) * perPage from a caller that wants page 2+.
export async function fetchIdxListings(filters: IdxSearchFilters, perPage = 24, start = 0): Promise<ScrapedListing[]> {
  const url = new URL(buildIdxSearchUrl(filters));
  url.searchParams.set("per", String(perPage));
  if (start > 0) url.searchParams.set("start", String(start));

  const html = await fetchIdxHtml(url.toString());
  return parseResultsCells(cheerio.load(html));
}

const SOLD_PENDING_URL = "https://search.royalpalmsrealty.com/idx/soldpending";

// This is Scott's own past sold/pending listings specifically (tied to his
// Agent ID on the account), not a general MLS-wide sold-comps feed — a real,
// public IDX Broker page (no login/access-code wall), confirmed live
// against the account's own admin "Sold/Pending" list. Fixed at 10 total
// results regardless of `per` — that's the real count, not a page-size cap.
export async function fetchSoldListings(perPage = 24): Promise<ScrapedListing[]> {
  const url = new URL(SOLD_PENDING_URL);
  url.searchParams.set("per", String(perPage));

  const html = await fetchIdxHtml(url.toString());
  return parseResultsCells(cheerio.load(html));
}

const FEATURED_URL = "https://search.royalpalmsrealty.com/idx/featured";

// Scott's own currently-active Featured listings (tied to his Agent/Featured
// IDs on the account) — a real, public IDX Broker page, confirmed live
// (data-propCat="featured" on each result cell).
export async function fetchFeaturedListings(perPage = 24): Promise<ScrapedListing[]> {
  const url = new URL(FEATURED_URL);
  url.searchParams.set("per", String(perPage));

  const html = await fetchIdxHtml(url.toString());
  return parseResultsCells(cheerio.load(html));
}
