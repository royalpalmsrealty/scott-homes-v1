import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { MlsPropertySchema, publicPropertyCandidate, type MlsProperty, type PropertyLookupResult } from "./offerProperty.ts";

const SelectionSchema = z.object({ reference: z.string().max(500), listingKey: z.string().max(500), mlsId: z.string().max(500), expires: z.number() }).strict();
const ResultsSchema = z.object({ records: z.array(MlsPropertySchema).max(10) }).strict();
const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

export function propertyLookupConfigured(): boolean {
  return Boolean(process.env.OFFER_MLS_LOOKUP_URL && process.env.OFFER_MLS_LOOKUP_TOKEN && process.env.SESSION_SECRET);
}

function mac(body: string, secret: string) {
  return createHmac("sha256", secret).update(`offer-property-v1:${body}`).digest("base64url");
}
export function signPropertySelection(reference: string, record: MlsProperty, secret: string, now = Date.now()) {
  const body = Buffer.from(JSON.stringify({ reference: normalize(reference), listingKey: record.listingKey, mlsId: record.mlsId, expires: now + 2 * 60 * 60 * 1000 })).toString("base64url");
  return `${body}.${mac(body, secret)}`;
}
export function readPropertySelection(token: string, reference: string, secret: string, now = Date.now()) {
  try {
    const [body, signature, extra] = token.split(".");
    if (!body || !signature || extra || token.length > 4000) return null;
    const expected = Buffer.from(mac(body, secret)), supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const parsed = SelectionSchema.safeParse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
    if (!parsed.success || parsed.data.expires <= now || parsed.data.reference !== normalize(reference)) return null;
    return parsed.data;
  } catch { return null; }
}

async function fetchRecords(reference: string, listingKey?: string): Promise<MlsProperty[]> {
  if (!propertyLookupConfigured()) throw new Error("MLS lookup is not connected.");
  const url = new URL(process.env.OFFER_MLS_LOOKUP_URL!);
  // Only the explicitly configured, read-only n8n lookup bridge receives its credential.
  if (url.origin !== "https://scottforman.app.n8n.cloud" || !url.pathname.startsWith("/webhook/") || url.username || url.password || url.search || url.hash) {
    throw new Error("Invalid MLS lookup configuration.");
  }
  url.searchParams.set("reference", reference);
  if (listingKey) url.searchParams.set("listingKey", listingKey);
  const response = await fetch(url, {
    method: "GET", headers: { authorization: `Bearer ${process.env.OFFER_MLS_LOOKUP_TOKEN}`, accept: "application/json" },
    signal: AbortSignal.timeout(8000), cache: "no-store", redirect: "error",
  });
  if (!response.ok) throw new Error("MLS lookup unavailable.");
  const raw = await response.text();
  if (Buffer.byteLength(raw) > 2_000_000) throw new Error("MLS response too large.");
  const { records } = ResultsSchema.parse(JSON.parse(raw));
  // The bridge must fetch fresh source data, never replay a stale record as current.
  const now = Date.now();
  if (records.some(record => now - Date.parse(record.retrievedAt) > 5 * 60_000 || Date.parse(record.retrievedAt) > now + 60_000)) throw new Error("MLS data is stale.");
  return records;
}

export async function searchOfferProperty(reference: string): Promise<PropertyLookupResult> {
  if (!propertyLookupConfigured()) return { state: "not_connected", candidates: [] };
  const records = await fetchRecords(reference);
  const candidates = records.map(record => publicPropertyCandidate(record, signPropertySelection(reference, record, process.env.SESSION_SECRET!)));
  // Never choose the first historical listing or an arbitrary unit automatically.
  return { state: candidates.length ? (candidates.length === 1 ? "matched" : "choices") : "not_found", candidates };
}

export async function resolveOfferProperty(reference: string, token: string): Promise<MlsProperty | null> {
  const choice = readPropertySelection(token, reference, process.env.SESSION_SECRET ?? "");
  if (!choice) return null;
  const records = await fetchRecords(reference, choice.listingKey);
  return records.find(record => record.listingKey === choice.listingKey && record.mlsId === choice.mlsId) ?? null;
}
