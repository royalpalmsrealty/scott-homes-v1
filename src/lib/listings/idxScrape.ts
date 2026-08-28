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
// data instead of a false "0 results" or a hard error. Client-confirmed
// (2026-08-29): listing counts barely move week to week, so 24 hours is a
// safe window to keep serving last-known-good numbers through an extended
// blocked window without ever showing meaningfully outdated inventory.
const STALE_FALLBACK_MS = 24 * 60 * 60 * 1000;
const lastGoodHtml = new Map<string, { html: string; savedAt: number }>();

// Client-reported concern (2026-08-26): every page load was hitting IDX
// Broker completely fresh, every time — real estate inventory doesn't
// change minute to minute, so that's more request volume than this needs,
// and higher request volume is exactly what makes their bot protection more
// likely to trigger in the first place. Serving an already-successful
// response for the same query within this window, with no network call at
// all, cuts that volume down without ever risking stale/wrong data for more
// than a few minutes. This only ever serves a response that passed a real
// res.ok check — never a failed/blocked one — so it can't reintroduce the
// original "shows a false empty result" bug. Widened from 5 minutes to 1
// hour on 2026-08-29 per client request — the only thing left using this
// path is the neighborhood tiles' counts, which change slowly enough that
// checking hourly instead of every 5 minutes loses nothing noticeable while
// cutting request volume by 12x.
const FRESH_CACHE_MS = 60 * 60 * 1000;

async function fetchIdxHtml(url: string): Promise<string> {
  const cached = lastGoodHtml.get(url);
  if (cached && Date.now() - cached.savedAt < FRESH_CACHE_MS) {
    return cached.html;
  }

  try {
    const res = await fetchIdxPage(url);
    if (!res.ok) throw new Error(`IDX Broker responded ${res.status} for ${url}`);
    const html = await res.text();
    lastGoodHtml.set(url, { html, savedAt: Date.now() });
    return html;
  } catch (err) {
    if (cached && Date.now() - cached.savedAt < STALE_FALLBACK_MS) {
      console.error(`IDX Broker fetch failed, serving ${Math.round((Date.now() - cached.savedAt) / 1000)}s-old fallback for ${url}`, err);
      return cached.html;
    }
    throw err;
  }
}

// Migration note (2026-08-26): general search/results/sold/details/featured
// scraping was removed from this file after IDX Broker's own support team
// confirmed in writing that server-side scraping their public pages isn't a
// supported integration method (and declined to allowlist this server's
// IP). Those pages are now embedded directly via <iframe> (see
// src/components/listings/IdxEmbed.tsx and buildIdxSearchUrl in
// ./idxSearch, which still builds the same URLs — just for an iframe src
// now, not a server-side fetch). What's left here is deliberately scoped to
// low-volume, per-listing/per-count usage: fetchListingDetail (used only by
// the Make an Offer flow, once per offer attempt — not bulk browsing) and
// fetchIdxResultsCount (the neighborhood tiles' live counts — a single
// per=1 request, no listing data).

function detailPath(mlsId: string, listingId: string, addressSlug: string) {
  return `/idx/details/listing/${mlsId}/${listingId}/${addressSlug}`;
}

export function buildOwnListingUrl(listing: { listingId: string; addressSlug: string }): string {
  return `/listings/${listing.listingId}-${listing.addressSlug}`;
}

export function parseOwnListingSlug(slug: string): { listingId: string; addressSlug: string } | null {
  const match = slug.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  return { listingId: match[1], addressSlug: match[2] };
}

export function buildIdxDetailUrl(listingId: string, addressSlug: string, mlsId = "b066"): string {
  // nowrapper=1 strips IDX Broker's own wrapper (see idxSearch.ts's
  // buildIdxSearchUrl for the full explanation) — visitors land here via a
  // real top-level redirect, so without this they'd see the old WordPress
  // site's mismatched sidebar/nav on an otherwise-branded page.
  return `https://search.royalpalmsrealty.com${detailPath(mlsId, listingId, addressSlug)}?nowrapper=1`;
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

export type IdxResultsCount = { count: number; isMinimum: boolean };

// Re-added 2026-08-29 for the neighborhood tiles' live counts (client
// request) — a single per=1 request just to read the total, not the full
// listing data behind it. Still the category of request IDX Broker's
// support team said isn't officially supported, but it's the smallest
// possible ask (no listing data, just a number) and goes through the same
// retry/cache-fallback machinery (fetchIdxHtml) as everything else here, so
// a transient block degrades to "no count shown" rather than a hard error.
export async function fetchIdxResultsCount(filters: IdxSearchFilters): Promise<IdxResultsCount> {
  const url = new URL(buildIdxSearchUrl(filters));
  url.searchParams.set("per", "1");

  const html = await fetchIdxHtml(url.toString());
  const $ = cheerio.load(html);

  // Two different templates, two different places the count lives — confirmed
  // live 2026-08-29 after activating the "Home Atlas" template for Results.
  // Legacy templates (Narrow, Content, etc.) render it as readable text in
  // .IDX-resultsCount ("77"). Home Atlas instead encodes it directly in a CSS
  // class name on the page container (IDX-totalResults-77) and doesn't render
  // the old text element at all. Try the new one first since it's what's
  // live now; fall back to the old selector for any page type still on a
  // legacy template (e.g. Sold/Pending, Featured).
  const classMatch = $(".IDX-pageContainer").first().attr("class")?.match(/IDX-totalResults-(\d+)/);
  const countText = classMatch?.[1] ?? $(".IDX-resultsCount").first().text().trim();
  const count = parseInt(countText.replace(/[^0-9]/g, ""), 10) || 0;
  const isMinimum = count >= 500 || $("#IDX-resultsCountMessage").text().includes("more than the maximum");

  return { count, isMinimum };
}

// Exported so /sold/page.tsx can point an <iframe> straight at it — IDX
// Broker's own page, not something we fetch/parse anymore (see the 2026-08-26
// migration comment at the top of this file: general search/results/sold
// pages moved to embedding IDX Broker's own pages after their support team
// confirmed server-side scraping isn't a supported integration method).
// nowrapper=1 strips IDX Broker's own wrapper (see idxSearch.ts's
// buildIdxSearchUrl for the full explanation) — needed here too since this
// URL also goes straight into an <iframe>, not through that function.
export const SOLD_PENDING_URL = "https://search.royalpalmsrealty.com/idx/soldpending?nowrapper=1";

// Migration note (2026-08-29): Featured Listings moved to the same <iframe>
// embed pattern as Search/Neighborhoods/Sold (see src/app/(site)/featured/page.tsx)
// — no server-side fetch of any kind, scraping or API, since even the
// occasional scrape-fallback failure this had (when no IDX_BROKER_API_KEY is
// configured) was showing the same "vanishes on refresh" symptom as
// everything else that used to scrape. The real authenticated API path
// (idxApi.ts) was removed along with it rather than left as dead code; if a
// future need for real Featured Listings *data* (not just display) comes up,
// idxApi.ts's git history has the working implementation to restore from.
export const FEATURED_URL = "https://search.royalpalmsrealty.com/idx/featured?nowrapper=1";
