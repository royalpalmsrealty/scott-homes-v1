import test from "node:test";
import assert from "node:assert/strict";
import { deriveJarvisConversationTurn } from "../src/lib/jarvis/conversation.ts";

test("extracts a complete first-turn consumer search", () => {
  const turn = deriveJarvisConversationTurn([
    { role: "user", content: "I’m looking for three bedrooms and two bathrooms in Casa Marina." },
  ]);
  assert.deepEqual(turn?.criteria, {
    neighborhood: "Casa Marina",
    minBeds: 3,
    minBaths: 2,
    pool: false,
  });
});

test("keeps requirements and resolves the first result during a pool refinement", () => {
  const context = {
    criteria: { neighborhood: "Casa Marina", minBeds: 3, minBaths: 2, pool: false },
    listingIds: ["619724", "618573", "620188"],
  };
  const turn = deriveJarvisConversationTurn(
    [
      { role: "user", content: "I’m looking for three bedrooms and two bathrooms in Casa Marina." },
      { role: "assistant", content: "I found three current matches." },
      { role: "user", content: "Find something similar to the first one, but with a pool." },
    ],
    context
  );
  assert.deepEqual(turn?.criteria, { ...context.criteria, pool: true });
  assert.equal(turn?.referenceListingId, "619724");
});

test("asks before relaxing a saved must-have", () => {
  const turn = deriveJarvisConversationTurn(
    [{ role: "user", content: "Show me two bedroom homes instead." }],
    {
      criteria: { neighborhood: "Casa Marina", minBeds: 3, minBaths: 2, pool: false },
      listingIds: ["619724"],
    }
  );
  assert.match(turn?.clarification ?? "", /relax/i);
});
