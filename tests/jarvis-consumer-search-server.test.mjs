import test from "node:test";
import assert from "node:assert/strict";
import {
  JarvisConsumerSearchInputSchema,
  searchConsumerListings,
} from "../src/lib/jarvis/consumerSearchServer.ts";

const criteria = {
  neighborhood: "Casa Marina",
  minBeds: 3,
  minBaths: 2,
  pool: true,
  limit: 7,
};

test("consumer search criteria are narrow, typed, and capped", () => {
  assert.equal(JarvisConsumerSearchInputSchema.safeParse(criteria).success, true);
  assert.equal(JarvisConsumerSearchInputSchema.safeParse({ ...criteria, limit: 26 }).success, false);
  assert.equal(JarvisConsumerSearchInputSchema.safeParse({ ...criteria, privateRemarks: true }).success, false);
});

test("the server rebuilds the IDX URL and never returns the bridge's listing payload", async () => {
  const previous = {
    fetch: globalThis.fetch,
    url: process.env.JARVIS_SEARCH_URL,
    token: process.env.JARVIS_SEARCH_TOKEN,
  };
  try {
    process.env.JARVIS_SEARCH_URL = "https://scottforman.app.n8n.cloud/webhook/fictional-jarvis-search";
    process.env.JARVIS_SEARCH_TOKEN = "fictional-test-token";
    globalThis.fetch = async (url, options) => {
      assert.equal(url.origin, "https://scottforman.app.n8n.cloud");
      assert.equal(url.searchParams.get("neighborhood"), "Casa Marina");
      assert.equal(url.searchParams.get("pool"), "true");
      assert.equal(options.method, "GET");
      assert.equal(options.redirect, "error");
      return Response.json({
        state: "ready",
        count: 2,
        listingIds: ["618573", "620188"],
        idxUrl: "https://malicious.example/professional-data",
        criteria,
      });
    };
    const result = await searchConsumerListings(criteria);
    assert.equal(result.state, "ready");
    assert.deepEqual(result.listingIds, ["618573", "620188"]);
    const idx = new URL(result.idxUrl);
    assert.equal(idx.origin, "https://search.royalpalmsrealty.com");
    assert.equal(idx.searchParams.get("csv_listingID"), "618573,620188");
    assert.equal("records" in result, false);
  } finally {
    globalThis.fetch = previous.fetch;
    for (const [name, value] of [
      ["JARVIS_SEARCH_URL", previous.url],
      ["JARVIS_SEARCH_TOKEN", previous.token],
    ]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("consumer search fails closed when disconnected or given an invalid bridge URL", async () => {
  const previousUrl = process.env.JARVIS_SEARCH_URL;
  const previousToken = process.env.JARVIS_SEARCH_TOKEN;
  try {
    delete process.env.JARVIS_SEARCH_URL;
    delete process.env.JARVIS_SEARCH_TOKEN;
    assert.equal((await searchConsumerListings(criteria)).state, "not_connected");
    process.env.JARVIS_SEARCH_URL = "https://example.com/webhook/not-allowed";
    process.env.JARVIS_SEARCH_TOKEN = "fictional-test-token";
    assert.equal((await searchConsumerListings(criteria)).state, "unavailable");
  } finally {
    if (previousUrl === undefined) delete process.env.JARVIS_SEARCH_URL;
    else process.env.JARVIS_SEARCH_URL = previousUrl;
    if (previousToken === undefined) delete process.env.JARVIS_SEARCH_TOKEN;
    else process.env.JARVIS_SEARCH_TOKEN = previousToken;
  }
});
