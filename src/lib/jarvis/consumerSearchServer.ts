import { z } from "zod";
import { buildIdxListingIdResultsUrl } from "../listings/idxSearch.ts";

export const JarvisConsumerSearchInputSchema = z
  .object({
    neighborhood: z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9 .'-]+$/),
    minBeds: z.number().finite().min(0).max(20),
    minBaths: z.number().finite().min(0).max(20),
    pool: z.boolean().default(false),
    limit: z.number().int().min(1).max(25).default(7),
  })
  .strict();

export type JarvisConsumerSearchInput = z.infer<typeof JarvisConsumerSearchInputSchema>;

const BridgeResponseSchema = z
  .object({
    state: z.enum(["ready", "empty"]),
    count: z.number().int().min(0).max(25),
    listingIds: z.array(z.string().regex(/^\d{5,10}$/)).max(25),
    idxUrl: z.string().url().nullable(),
    criteria: JarvisConsumerSearchInputSchema,
  })
  .strict();

export type JarvisConsumerSearchResult =
  | ({ state: "ready"; listingIds: string[]; idxUrl: string; count: number } & {
      criteria: JarvisConsumerSearchInput;
    })
  | ({ state: "empty" | "not_connected" | "unavailable"; listingIds: []; idxUrl: null; count: 0 } & {
      criteria: JarvisConsumerSearchInput;
    });

export function consumerSearchConfigured(): boolean {
  return Boolean(process.env.JARVIS_SEARCH_URL && process.env.JARVIS_SEARCH_TOKEN);
}

function bridgeUrl(criteria: JarvisConsumerSearchInput): URL {
  const url = new URL(process.env.JARVIS_SEARCH_URL!);
  if (
    url.origin !== "https://scottforman.app.n8n.cloud" ||
    !url.pathname.startsWith("/webhook/") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("Invalid JARVIS search configuration.");
  }
  url.searchParams.set("neighborhood", criteria.neighborhood);
  url.searchParams.set("minBeds", String(criteria.minBeds));
  url.searchParams.set("minBaths", String(criteria.minBaths));
  url.searchParams.set("pool", String(criteria.pool));
  url.searchParams.set("limit", String(criteria.limit));
  return url;
}

export async function searchConsumerListings(
  unparsedCriteria: JarvisConsumerSearchInput
): Promise<JarvisConsumerSearchResult> {
  const criteria = JarvisConsumerSearchInputSchema.parse(unparsedCriteria);
  if (!consumerSearchConfigured()) {
    return { state: "not_connected", listingIds: [], idxUrl: null, count: 0, criteria };
  }

  try {
    const response = await fetch(bridgeUrl(criteria), {
      method: "GET",
      headers: {
        authorization: `Bearer ${process.env.JARVIS_SEARCH_TOKEN}`,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) throw new Error("JARVIS search bridge unavailable.");
    const raw = await response.text();
    if (Buffer.byteLength(raw) > 64_000) throw new Error("JARVIS search response too large.");
    const bridge = BridgeResponseSchema.parse(JSON.parse(raw));
    const listingIds = [...new Set(bridge.listingIds)];
    if (
      bridge.count !== listingIds.length ||
      (bridge.state === "ready") !== (listingIds.length > 0)
    ) {
      throw new Error("Invalid JARVIS search response.");
    }
    if (!listingIds.length) {
      return { state: "empty", listingIds: [], idxUrl: null, count: 0, criteria };
    }
    return {
      state: "ready",
      listingIds,
      idxUrl: buildIdxListingIdResultsUrl(listingIds, "price-desc"),
      count: listingIds.length,
      criteria,
    };
  } catch {
    return { state: "unavailable", listingIds: [], idxUrl: null, count: 0, criteria };
  }
}
