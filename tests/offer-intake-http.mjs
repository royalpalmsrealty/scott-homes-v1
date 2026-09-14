// Run after building with NEXT_PUBLIC_OFFER_AGENT_ID set to the offer agent ID.
// Uses a local child server with all storage and MLS access disabled.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { load } from "cheerio";
import { representationChoices } from "../src/lib/offerIntake.ts";

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3010", "--hostname", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "", SESSION_SECRET: "", OFFER_MLS_LOOKUP_URL: "", OFFER_MLS_LOOKUP_TOKEN: "", VERCEL: "" },
});
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Local server did not become ready")), 15000);
    server.stdout.on("data", chunk => { if (chunk.toString().includes("Ready")) { clearTimeout(timer); resolve(); } });
    server.on("exit", code => { clearTimeout(timer); reject(new Error(`Local server exited: ${code}`)); });
  });
  const base = "http://127.0.0.1:3010";
  const homepage = await fetch(base, { signal: AbortSignal.timeout(5000) });
  assert.equal(homepage.status, 200);
  const $ = load(await homepage.text());
  const primary = $('header nav[aria-label="Primary"]');
  assert.equal(primary.length, 1, 'One visible primary navigation for all screen widths');
  const expectedLabels = ['Search', 'Neighborhoods', 'Featured', 'Sold Listings', 'Rentals', 'Buyers', 'Sellers', 'Blog', 'About', 'Contact'];
  const labels = primary.find('> ul > li > a, > ul > li > button').map((_, element) => $(element).text().trim()).get();
  assert.deepEqual(labels, expectedLabels);
  for (const element of [...primary.parents().toArray(), ...primary.find('*').toArray(), primary[0]]) {
    assert.ok(!$(element).is('[hidden]'), 'Navigation is not hidden');
    assert.doesNotMatch($(element).attr('class') ?? '', /(?:^|\s)(?:\S+:)?(?:hidden|invisible)(?:\s|$)/, 'Navigation has no width-dependent hiding rule');
  }
  assert.equal($('header a[href="/home-value"]').length, 1);
  assert.ok($('header').text().includes('Make an Offer'));
  console.log('All ten navigation labels are rendered without width-dependent hiding.');
  assert.equal($('#offer-agent-question').length, 0, 'Default voice entry has no written other-agent question');
  assert.equal($('#offer-answer').length, 0, 'Default voice entry has no address input or dropdown');
  assert.equal($('[aria-labelledby="offer-agent-question"]').length, 0, 'No form gate precedes the voice conversation');
  const callLink = $('dialog a').filter((_, element) => $(element).text() === 'Call Scott now');
  assert.equal(callLink.length, 1, 'A live-person call link is available even before starting the AI');
  assert.equal(callLink.attr('href'), 'tel:3059239884', 'Human help calls Scott directly');
  assert.equal(callLink.parents('[class*="overflow-y-auto"]').length, 0, 'The call link stays outside the scrolling intake');
  const draft = { propertyReference: "123 Example Street, Key West, FL", buyerName: "Example Buyer", buyerEmail: "buyer@example.com", buyerPhone: "3055550100", offerPrice: "1250000", financing: "Cash", deposit: "Discuss with Scott", inspection: "15 days", closingDate: "Within 60 days", conditions: "None", representation: "No current agent" };
  Object.assign(draft, { titleInsurance: "Seller pays title insurance", closingCompany: "Discuss with Scott", financingContingency: "" });
  draft.representation = representationChoices.transactionBroker;
  const payload = { draft, confirmed: true, requestId: "6b3768a4-b583-4ca0-8406-72df85b00dc3" };
  const headers = { "content-type": "application/json", origin: base };
  const healthEvent = { version: 1, session: '85fb9923-7486-413a-b984-ddb2433f0bca', event: 'start_blocked', platform: 'ios', browser: 'safari_family', framed: false };
  for (const [requestHeaders, body, expected] of [
    [headers, healthEvent, 204],
    [headers, { ...healthEvent, transcript: 'Fictional text must never enter diagnostics' }, 400],
    [{ ...headers, origin: 'https://example.org' }, healthEvent, 403],
  ]) {
    const response = await fetch(`${base}/api/voice-health`, { method: 'POST', headers: requestHeaders, body: JSON.stringify(body) });
    assert.equal(response.status, expected, 'Voice diagnostics accept only same-site fixed events');
  }
  console.log('Voice diagnostics accept fixed events and reject speech content or foreign origins.');
  const scenarios = [
    ["foreign origin", { ...headers, origin: "https://example.org" }, payload, 403],
    ["missing confirmation", headers, { ...payload, confirmed: false }, 400],
    ["unresolved agent relationship", headers, { ...payload, draft: { ...draft, representation: representationChoices.otherAgent } }, 400],
    ["oversized request", headers, { ...payload, padding: "x".repeat(17000) }, 413],
    ["unconfigured durable storage", headers, payload, 503],
  ];
  for (const [name, requestHeaders, body, expected] of scenarios) {
    const response = await fetch(`${base}/api/offer-intake`, { method: "POST", headers: requestHeaders, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, expected, name);
    console.log(`${name}: ${response.status}`);
  }
  const admin = await fetch(`${base}/admin/offer-requests`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
  assert.equal(admin.status, 307);
  assert.match(admin.headers.get("location"), /\/admin\/login/);
  console.log("Unconfigured private review redirects to login.");
  const packet = await fetch(`${base}/api/admin/offer-requests/${payload.requestId}`);
  assert.equal(packet.status, 401, 'MLS/buyer packet requires broker authentication');
  const lookup = await fetch(`${base}/api/offer-intake/property`, { method: 'POST', headers, body: JSON.stringify({reference: draft.propertyReference}) });
  assert.deepEqual(await lookup.json(), {state: 'not_connected', candidates: []}, 'Missing MLS connection never becomes a fabricated match');
  const foreignLookup = await fetch(`${base}/api/offer-intake/property`, { method: 'POST', headers: {...headers, origin: 'https://example.org'}, body: JSON.stringify({reference: draft.propertyReference}) });
  assert.equal(foreignLookup.status, 403);
  console.log('MLS lookup fails honestly when unconfigured; broker packet is protected.');
} finally {
  server.kill("SIGTERM");
}
