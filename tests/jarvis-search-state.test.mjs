import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCriteriaPatch,
  createJarvisSearchState,
  dismissProperty,
  favoriteProperty,
  recordDisplayedResults,
  resolvePropertyReference,
} from "../src/lib/jarvis/state.ts";
import { ConsumerListingCardSchema } from "../src/lib/jarvis/schemas.ts";

function listing(stableId, address, pool = null) {
  return {
    source: "idx",
    stableId,
    listingId: stableId.replace("idx:b066:", ""),
    address,
    city: "Key West",
    state: "FL",
    postalCode: "33040",
    price: 1_500_000,
    status: "Active",
    beds: 3,
    baths: 2,
    squareFeet: 1_700,
    pool,
    photoUrl: `https://cdn.photos.sparkplatform.com/test/${stableId}.jpg`,
    detailUrl: `https://search.royalpalmsrealty.com/idx/details/listing/b066/${stableId}/test-home`,
    attribution: "Listing courtesy of Test Brokerage",
    retrievedAt: "2026-09-15T20:00:00.000Z",
  };
}

const casa = listing("idx:b066:100", "100 Casa Marina Court", false);
const riviera = listing("idx:b066:200", "200 Riviera Drive", true);
const otherPool = listing("idx:b066:300", "300 Riviera Drive", true);

test("follow-up criteria retain unchanged must-haves and resolve the first displayed property", () => {
  let state = createJarvisSearchState();
  state = applyCriteriaPatch(state, {
    neighborhoods: { value: ["Casa Marina"], strength: "must" },
    minBeds: { value: 3, strength: "must" },
    minBaths: { value: 2, strength: "must" },
  });
  state = recordDisplayedResults(state, [casa, riviera]);
  state = applyCriteriaPatch(state, {
    pool: { value: true, strength: "must" },
    similarTo: { kind: "ordinal", ordinal: 1 },
  });

  assert.deepEqual(state.criteria.neighborhoods.value, ["Casa Marina"]);
  assert.equal(state.criteria.minBeds.value, 3);
  assert.equal(state.criteria.minBaths.value, 2);
  assert.equal(state.criteria.pool.value, true);
  assert.equal(state.criteria.similarToPropertyId, casa.stableId);
});

test("must-haves cannot be silently relaxed", () => {
  let state = createJarvisSearchState();
  state = applyCriteriaPatch(state, { minBeds: { value: 3, strength: "must" } });
  assert.throws(
    () => applyCriteriaPatch(state, { minBeds: { value: 2, strength: "must" } }),
    /Confirmation required/
  );
  state = applyCriteriaPatch(
    state,
    { minBeds: { value: 2, strength: "must" } },
    { relaxMustHaves: true }
  );
  assert.equal(state.criteria.minBeds.value, 2);
});

test("adding an alternative to a must-have neighborhood requires confirmation", () => {
  let state = createJarvisSearchState();
  state = applyCriteriaPatch(state, {
    neighborhoods: { value: ["Casa Marina"], strength: "must" },
  });
  assert.throws(
    () =>
      applyCriteriaPatch(state, {
        neighborhoods: { value: ["Casa Marina", "Midtown West"], strength: "must" },
      }),
    /Confirmation required/
  );
});

test("ambiguous conversational cues require clarification", () => {
  let state = recordDisplayedResults(createJarvisSearchState(), [casa, riviera, otherPool]);
  const resolution = resolvePropertyReference(state, { kind: "cue", words: ["Riviera", "pool"] });
  assert.equal(resolution.status, "ambiguous");
  assert.equal(resolution.candidates.length, 2);
});

test("favorites and dismissals use stable identity rather than result position", () => {
  let state = recordDisplayedResults(createJarvisSearchState(), [casa, riviera]);
  state = favoriteProperty(state, { kind: "ordinal", ordinal: 1 });
  state = recordDisplayedResults(state, [riviera, casa]);
  state = dismissProperty(state, { kind: "ordinal", ordinal: 2 });
  assert.deepEqual(state.favoriteIds, []);
  assert.deepEqual(state.dismissedIds, [casa.stableId]);
});

test("consumer cards fail closed on extra or non-IDX data", () => {
  assert.equal(ConsumerListingCardSchema.safeParse(casa).success, true);
  assert.equal(
    ConsumerListingCardSchema.safeParse({ ...casa, privateRemarks: "Broker-only" }).success,
    false
  );
  assert.equal(
    ConsumerListingCardSchema.safeParse({ ...casa, detailUrl: "https://flexmls.com/private" }).success,
    false
  );
});

