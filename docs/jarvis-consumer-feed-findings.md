# JARVIS consumer search: verified starting point

Verified on 2026-09-15.

## Current behavior

- The website chat `searchListings` tool returns a live result count and an IDX Broker hosted-results URL.
- It does not receive individual listing records, photos, or detail URLs, so it cannot truthfully discuss or compare individual properties.
- The website displays broad IDX results through a cross-origin IDX Broker iframe.
- The existing `RPR Offer MLS — Website Lookup` handoff is an exact-property professional lookup. It is not an MLS-wide consumer-search source and must not be repurposed for consumer display without explicit feed authorization.

## Consumer data-source finding

IDX Broker's official API documentation states that its API does not return MLS-wide listing data. The exception is listings belonging to agents on the IDX Broker account. The API can expose featured/account listings, saved links, widget URLs, search fields, and related account metadata.

Source: https://developers.idxbroker.com/idx-broker-api/

The repository history also records that IDX Broker support declined server-side scraping/allowlisting. Broad scraping was therefore removed in favor of IDX-hosted iframe results. JARVIS must not restore that unsupported integration.

## Verified FlexMLS-to-IDX handoff

The Royal Palms IDX Broker account exposes an official Listing ID search form at `/idx/search/listingid`. Its submitted field is `csv_listingID`; the form states that it accepts up to 25 comma-separated MLS numbers.

Live verification on 2026-09-16 used MLS numbers `619724,618573`. The resulting IDX page reported exactly two results and contained only those two listing IDs. Reversing the input did not reverse the output because IDX applies its own sort; the tested default was price descending. The application therefore now supplies an explicit supported sort.

This enables the proposed boundary: FlexMLS performs the server-side selection, while IDX Broker performs the consumer-facing listing display.

### Verified first search loop

On 2026-09-16, a live FlexMLS search for active Casa Marina residential listings with at least three bedrooms, at least two bathrooms, and a pool returned these four MLS numbers in descending-price order:

1. `618573`
2. `620188`
3. `619978`
4. `620332`

Passing those identifiers to IDX Broker returned exactly the same four listings. The verified IDX URL contract is:

```text
https://search.royalpalmsrealty.com/idx/results/listings?idxID=b066&csv_listingID=<comma-separated-MLS-numbers>&srt=prd&per=<result-count>&nowrapper=1
```

An n8n workflow named `RPR JARVIS — Flex Search to IDX` now automates this loop. Its manual test completed successfully with this consumer-safe response:

```json
{
  "state": "ready",
  "count": 4,
  "listingIds": ["618573", "620188", "619978", "620332"],
  "idxUrl": "https://search.royalpalmsrealty.com/idx/results/listings?idxID=b066&csv_listingID=618573,620188,619978,620332&srt=prd&per=4&nowrapper=1",
  "criteria": {
    "neighborhood": "Casa Marina",
    "minBeds": 3,
    "minBaths": 2,
    "pool": true,
    "limit": 7
  }
}
```

The workflow validates the supported criteria, caps the upstream result set at 25, filters out records disallowed for Internet display, and returns only listing identifiers, the IDX URL, and the normalized criteria. It does not return professional MLS fields to the consumer client. Header authentication was verified on the webhook node, and the workflow has its own path, `jarvis-consumer-search-v1`.

Published on 2026-09-16 as `Consumer FlexMLS to IDX bridge v1` with a dedicated header credential. `JARVIS_SEARCH_URL` and `JARVIS_SEARCH_TOKEN` were added to the Vercel `scott-homes` project for Production. A new deployment is still required for those variables and the locally implemented `/api/jarvis/search` route to become active. Do not redeploy the older production source: the JARVIS branch must first be pushed or otherwise delivered to Vercel so the new route is included.

## Implementation boundary

The shared JARVIS state engine is independent of the listing provider. The consumer adapter remains fail-closed until the FlexMLS identifier search is connected and the identifier-handoff use is confirmed as permitted. The supported paths are:

1. The verified FlexMLS search → comma-separated MLS numbers → IDX Broker results-page flow.
2. An IDX vendor product/API that explicitly returns MLS-wide consumer-display records and permits conversational use.
3. Written authorization and credentials for a consumer-display endpoint from the MLS/Spark/IDX provider.

The required minimum consumer record is: stable source identity, MLS/listing identifier, address, current price and status, permitted beds/baths/size/pool fields, primary photo, working IDX detail URL, listing attribution, and retrieval timestamp.

## Source/deployment finding

- Live Vercel project: `scott-homes` (`prj_nveCkg6sUJjoSSZw1Qv0vf0Jx8VX`).
- Live production deployment verified: `dpl_4KxsSsczQmgUpm2RMNtbGV6B1Uq6`.
- The Vercel project currently links to `royalpalmsrealty/scott-homes`, which is not available through the connected GitHub account.
- The available source repository is `royalpalmsrealty/scott-homes-v1`.
- The newest live deployment contains website changes newer than the Git-connected production baseline. JARVIS work is isolated on `codex/jarvis-consumer-core` to avoid overwriting those live changes.
