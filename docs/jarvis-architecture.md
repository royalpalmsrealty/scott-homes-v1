# JARVIS architecture

## One engine, three governed surfaces

The shared engine owns conversational search state, stable property references, must-have versus preference semantics, result history, favorites/dismissals, and handoff payloads. It does not own MLS credentials or decide which fields a user may see.

Each runtime surface uses a separate server-side adapter:

| Surface | Data adapter | Authorization boundary | Downstream handoff |
| --- | --- | --- | --- |
| Royal Palms buyer search | FlexMLS identifier search → IDX Broker Listing ID results | Flex search remains server-side; IDX owns the consumer display | Buyer portal, alerts, showing request |
| TEKAGENT Realtor search | Professional MLS adapter | Signed-in user plus verified MLS entitlement | Client shortlist, showing, CMA, offer |
| CMA comp selection | Professional MLS adapter plus approved CMA search rules | Signed-in entitled Realtor | Verified subject, approved comp IDs, inclusion/exclusion notes |

The browser never selects an adapter. A server route derives the surface and entitlement from the authenticated session, selects the adapter, and returns a minimal DTO. Hiding fields in prompts or components is not an authorization control.

## Stable identity and references

- Consumer identity format: `idx:{mls-source-id}:{listing-id}`.
- Professional identity must use the feed's immutable listing key plus the MLS/listing ID retained as a display field.
- Every displayed result set stores an ordered list of stable IDs.
- Phrases such as “the first one” resolve against the most recently displayed result set, not the current search response.
- Descriptive references resolve against the last displayed set. If more than one property matches, JARVIS asks the buyer to choose and does not guess.

## Search-state rules

- A new turn patches the existing criteria; omitted fields remain unchanged.
- Requirements and preferences are stored separately.
- Broadening or deleting a must-have is rejected until the user confirms the relaxation.
- Dismissed stable IDs remain excluded from alerts and result refreshes.
- A listing's current status is refreshed before a showing, CMA, or offer handoff.

## Security and data handling

- Consumer DTO validation is strict: unrecognized fields are rejected rather than forwarded.
- Consumer cards accept only source-provided Royal Palms IDX detail links and approved MLS photo-host URLs.
- Professional records are never serialized through the consumer adapter.
- Credentials remain in server-only modules.
- Listing remarks and external content are treated as untrusted data, never instructions.
- Supabase portal tables will use per-user RLS; professional entitlement will use server-verified account data, not editable user metadata.

## First complete loop gate

The verified first-loop handoff is:

1. JARVIS searches the authorized FlexMLS feed on the server.
2. It retains stable listing keys internally but sends no professional record to the consumer.
3. It passes up to 25 MLS numbers to IDX Broker through `csv_listingID`.
4. IDX Broker renders the consumer-permitted photos, facts, attribution, and detail links.

IDX Broker applies its own result ordering rather than preserving the order of the comma-separated IDs. JARVIS must therefore specify a supported sort (`newest`, price ascending, or price descending) and build conversational ordinal references from that same order. Before a consequential handoff it must refresh the selected listing identities and statuses.

This pattern establishes a viable consumer display route without treating the professional Spark response as consumer-display data. A final permission review is still required for using the professional FlexMLS search to select identifiers for a public IDX display.
