# Offer MLS handoff — implementation and activation

September 14, 2026. Website code is implemented and tested with synthetic source responses. **Live MLS lookup is not activated.** Vercel has no MLS credential or lookup bridge configuration. The saved `Flex MLS` HTTP Header Auth credential is in Scott's existing n8n account. Browser editor operations time out, so no n8n workflow or credential was changed in this turn.

## Broker record

After the buyer supplies the property, the website calls its same-origin `/api/offer-intake/property` endpoint. A configured lookup returns up to ten exact candidate records. One exact result is selected; several units or listing-history records require an explicit choice. Unavailable/empty results remain visibly unverified; the interview can continue. Changing the property invalidates the previous selection. The AI receives public address/MLS-number/status only and may not claim a match after an unavailable result.

Selected identity is signed with the existing server SESSION_SECRET, bound to the buyer reference including unit, and expires after two hours. On buyer-confirmed submission the server fetches that ListingKey again and verifies MlsId. The saved record contains:

| Field | Purpose |
| --- | --- |
| source, mlsId, listingId, listingKey | Exact source and stable automation identifiers |
| mlsUrl | Source-provided HTTPS FlexMLS record/share link; never an invented URL or a substitute website-search link |
| address, status, listPrice, retrievedAt | Property identity and current source facts |
| listingAgent | Name, source identifier, email and phone, with null for unavailable values |
| listingOffice | Name, source identifier and phone |
| propertyDetails | All available permitted property fields, including legal/parcel details where supplied |
| sourceRecord | Original permitted MLS response for later automation; broker-only |
| draft / buyerRequest | Buyer-proposed terms and contact details, separate from listing facts |
| routing | `awaiting_broker_choice`, automation null |

The authenticated `/admin/offer-requests` page displays the MLS link, current listing facts, agent and office information, and property details. A protected JSON download includes the complete property source record and buyer terms. No automation is chosen or triggered by that download. No email, text, seller submission or contract is sent by these changes.

## Read-only n8n bridge contract

Create a separate authenticated GET webhook in `scottforman.app.n8n.cloud` using the existing `Flex MLS` credential. Do not point the site at the existing contract-intake form or execute that workflow merely to look up a listing. Existing contract and CMA workflows remain unchanged.

Server configuration, after live verification:

- `OFFER_MLS_LOOKUP_URL`: the published HTTPS `/webhook/...` URL of this dedicated lookup.
- `OFFER_MLS_LOOKUP_TOKEN`: server-only bearer credential accepted by that webhook.
- Existing `SESSION_SECRET`: signs browser selection tokens.

The website permits only the exact n8n host above, refuses redirects and query-bearing configured URLs, and never sends these credentials to the browser or ElevenLabs. GET parameters are `reference` and, on final retrieval, `listingKey`. The endpoint must implement no delivery, contact, contract, payment or other mutation actions.

Bridge responsibilities:

1. Validate and bound the reference, preserving unit numbers. Use the working live Spark lookup configuration and saved credential; older exported CMA JSON contains stale environment-variable references and must not replace it.
2. Resolve address/MLS reference through actual supported Spark metadata and exact normalized address or MLS ID filters. Escape SparkQL literals. Never fetch an arbitrary URL supplied by the buyer.
3. Return all exact matching current/history candidates, at most ten; do not silently select a unit or substitute a nearby address. Ask for a more precise reference if the result set exceeds the limit. A supplied listingKey must constrain the exact record on refresh.
4. Retrieve the source-provided FlexMLS record/share URL through supported source capabilities. If the existing feed cannot produce that URL, report unavailable rather than constructing a plausible URL from ListingId. Preserve ListingKey separately from the human-facing MLS number.
5. Normalize the record to `MlsPropertySchema` in `src/lib/offerProperty.ts`. Use null for unavailable price/agent/office values. Keep all permitted property fields and the underlying source record for private broker review. Set `publicDisplayAllowed: true` only for candidates allowed to be identified to the buyer and preserve office attribution. Never return restricted listings as public candidates.
6. Return `{ "records": [...] }`, current `retrievedAt` ISO timestamps, at most 2 MB, within eight seconds. Return `{ "records": [] }` for no match. Use a non-2xx response for connection/source failures. Do not mask failures as matches. Source records, MLS links, and agent contacts remain in the server-to-server response; the website strips them from buyer responses.

## Remaining activation and verification

Configure and test the actual bridge using the saved n8n credential; confirm a real FlexMLS link, stable IDs, legal/parcel details, listing agent and office. Test a multi-unit ambiguity and a listing-history ambiguity. Then set the two server variables for Preview and deploy. Confirm a broker-only test packet contains the exact source link and IDs. No live MLS call or enriched production lead was performed in this turn.

Website tests cover tampered/expired/cross-unit selections, private-data exclusion from buyer responses, link validation, duplicate-history disambiguation, exact-key refresh, stale data rejection, credential destination restrictions, unconfigured-source handling and protected download access.
