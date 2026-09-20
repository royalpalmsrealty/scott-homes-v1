import test from "node:test";
import assert from "node:assert/strict";
import { buildIdxListingIdResultsUrl } from "../src/lib/listings/idxSearch.ts";

test("FlexMLS identifiers are handed to IDX Broker through its verified CSV field", () => {
  const url = new URL(buildIdxListingIdResultsUrl(["619724", "618573"], "price-desc"));
  assert.equal(url.origin, "https://search.royalpalmsrealty.com");
  assert.equal(url.pathname, "/idx/results/listings");
  assert.equal(url.searchParams.get("idxID"), "b066");
  assert.equal(url.searchParams.get("csv_listingID"), "619724,618573");
  assert.equal(url.searchParams.get("srt"), "prd");
  assert.equal(url.searchParams.get("per"), "2");
  assert.equal(url.searchParams.get("nowrapper"), "1");
});

test("the handoff deduplicates IDs and rejects unsafe or oversized input", () => {
  const deduplicated = new URL(buildIdxListingIdResultsUrl(["619724", "619724"]));
  assert.equal(deduplicated.searchParams.get("csv_listingID"), "619724");
  assert.throws(() => buildIdxListingIdResultsUrl([]), /At least one/);
  assert.throws(() => buildIdxListingIdResultsUrl(["619724&hp=1"]), /Invalid MLS/);
  assert.throws(
    () => buildIdxListingIdResultsUrl(Array.from({ length: 26 }, (_, index) => String(index + 1))),
    /at most 25/
  );
});

