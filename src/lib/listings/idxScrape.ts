import * as cheerio from "cheerio";
import { buildIdxSearchUrl, type IdxSearchFilters } from "./idxSearch";

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
    const fieldLabel = $(el).find(".IDX-summaryFieldLabel").text().trim();
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
    fetch(detailUrl, { headers: { "User-Agent": "Mozilla/5.0" } }),
    fetch(galleryUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).catch(() => null),
  ]);
  if (!detailRes.ok) return null;

  const $ = cheerio.load(await detailRes.text());

  const number = $(".IDX-detailsAddressNumber").first().text().trim();
  const street = $(".IDX-detailsAddressName").first().text().trim();
  if (!number && !street) return null; // page rendered but no listing at this ID (removed/expired)

  const html = $.html();
  const lat = html.match(/data-lat="([^"]*)"/)?.[1];
  const lng = html.match(/data-lng="([^"]*)"/)?.[1];

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
    status: findSummaryField($, "Status") ?? "Active",
    beds: parseNumber(findSummaryField($, "Bedrooms")),
    fullBaths: parseNumber(findSummaryField($, "Full Baths")),
    partialBaths: parseNumber(findSummaryField($, "Partial Baths")),
    totalBaths: parseNumber(findSummaryField($, "Total Baths")),
    sqft: parseNumber(findSummaryField($, "SqFt")),
    acres: parseNumber(findSummaryField($, "Acres")),
    yearBuilt: parseNumber(findSummaryField($, "Year Built")),
    description: $("#IDX-detailsDescription").first().text().replace(/\s+/g, " ").trim(),
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

  const res = await fetch(url.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return { count: 0, isMinimum: false };

  const html = await res.text();
  const $ = cheerio.load(html);
  const countText = $(".IDX-resultsCount").first().text().trim();
  const count = parseInt(countText.replace(/[^0-9]/g, ""), 10) || 0;
  const isMinimum = $("#IDX-resultsCountMessage").text().includes("more than the maximum");

  return { count, isMinimum };
}

export async function fetchIdxListings(filters: IdxSearchFilters, perPage = 24): Promise<ScrapedListing[]> {
  const url = new URL(buildIdxSearchUrl(filters));
  url.searchParams.set("per", String(perPage));

  const res = await fetch(url.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    throw new Error(`IDX results fetch failed: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

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
      price: parseNumber(cell.attr("data-price")) ?? 0,
      beds: parseNumber(cell.find(".IDX-resultsField-bedrooms .IDX-resultsText").first().text()),
      baths: parseNumber(cell.find(".IDX-resultsField-totalBaths .IDX-resultsText").first().text()),
      sqft: parseNumber(cell.find(".IDX-resultsField-sqFt .IDX-resultsText").first().text()),
      photoUrl: cell.find(".IDX-resultsPhotoImg").first().attr("src") ?? null,
      status: cell.attr("data-idxstatus") ?? "active",
      description: cell.find(".IDX-resultsDescription").first().text().trim(),
    });
  });

  return listings;
}
