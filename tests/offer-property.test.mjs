import test from 'node:test';
import assert from 'node:assert/strict';
import { MlsPropertySchema, propertyLookupMessage, publicPropertyCandidate } from '../src/lib/offerProperty.ts';
import { readPropertySelection, resolveOfferProperty, searchOfferProperty, signPropertySelection } from '../src/lib/offerPropertyServer.ts';

const reference = '123 Example Lane, Unit 4, Key West, FL';
const record = {
  source: 'FlexMLS', listingKey: 'example-key-4', listingId: '123456', mlsId: 'example-mls',
  mlsUrl: 'https://www.flexmls.com/share/example-test', address: reference, status: 'Active', listPrice: 1000000,
  retrievedAt: new Date().toISOString(), publicDisplayAllowed: true,
  listingAgent: { name: 'Example Agent', id: 'agent-123', email: 'agent@example.com', phone: '2025550142' },
  listingOffice: { name: 'Example Office', id: 'office-123', phone: '2025550143' },
  propertyDetails: { beds: 3, baths: 2, legalDescription: 'Fictional test parcel' },
  sourceRecord: { ListingKey: 'example-key-4', PrivateRemarks: 'Broker-only test data' },
};
test('selection tokens are bound to the exact address including unit and cannot be altered', () => {
  const token = signPropertySelection(reference, record, 'test-only-secret', 1000);
  assert.equal(readPropertySelection(token, reference.toUpperCase(), 'test-only-secret', 2000).listingKey, record.listingKey);
  assert.equal(readPropertySelection(token, reference.replace('Unit 4', 'Unit 5'), 'test-only-secret', 2000), null);
  assert.equal(readPropertySelection(token + 'changed', reference, 'test-only-secret', 2000), null);
  assert.equal(readPropertySelection(token, reference, 'wrong-key', 2000), null);
  assert.equal(readPropertySelection(token, reference, 'test-only-secret', 8_000_000), null);
});
test('buyer matching results exclude MLS private data and agent contacts', () => {
  const candidate = publicPropertyCandidate(record, 'signed-selection');
  assert.equal(candidate.listingId, '123456');
  for (const field of ['sourceRecord', 'propertyDetails', 'listingAgent', 'listingOffice', 'mlsUrl']) assert.equal(field in candidate, false);
});
test('MLS links must be real HTTPS FlexMLS source links without credential URLs', () => {
  assert.equal(MlsPropertySchema.safeParse(record).success, true);
  for (const mlsUrl of ['javascript:alert(1)', 'https://flexmls.com.evil.example/a', 'https://user:password@flexmls.com/a', 'https://example.com/listing']) {
    assert.equal(MlsPropertySchema.safeParse({ ...record, mlsUrl }).success, false);
  }
});
test('lookup disambiguates listings, refreshes by stable identity and fails closed on stale or misrouted data', async () => {
  const previous = { fetch: globalThis.fetch, url: process.env.OFFER_MLS_LOOKUP_URL, token: process.env.OFFER_MLS_LOOKUP_TOKEN, secret: process.env.SESSION_SECRET };
  let records = [record], calls = 0;
  try {
    delete process.env.OFFER_MLS_LOOKUP_URL;
    assert.deepEqual(await searchOfferProperty(reference), { state: 'not_connected', candidates: [] });
    process.env.OFFER_MLS_LOOKUP_URL = 'https://scottforman.app.n8n.cloud/webhook/fictional-read-only-test';
    process.env.OFFER_MLS_LOOKUP_TOKEN = 'fictional-test-bridge-credential'; process.env.SESSION_SECRET = 'fictional-test-session';
    globalThis.fetch = async (url, options) => {
      calls++; assert.equal(url.origin, 'https://scottforman.app.n8n.cloud');
      assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
      assert.equal(url.searchParams.get('reference'), reference);
      return Response.json({ records });
    };
    const result = await searchOfferProperty(reference);
    assert.equal(result.state, 'matched');
    const full = await resolveOfferProperty(reference, result.candidates[0].selection);
    assert.deepEqual(full.listingAgent, record.listingAgent);
    assert.deepEqual(full.sourceRecord, record.sourceRecord);
    records = [];
    assert.equal((await searchOfferProperty(reference)).state, 'not_found');
    records = [record, { ...record, listingKey: 'different-history', listingId: '654321', status: 'Closed' }];
    assert.equal((await searchOfferProperty(reference)).state, 'choices');
    records = [{ ...record, listingKey: 'different-key' }];
    assert.equal(await resolveOfferProperty(reference, result.candidates[0].selection), null);
    records = [{ ...record, retrievedAt: '2000-01-01T00:00:00.000Z' }];
    await assert.rejects(searchOfferProperty(reference), /stale/);
    const before = calls; process.env.OFFER_MLS_LOOKUP_URL = 'https://unrelated.example/webhook/lookup';
    await assert.rejects(searchOfferProperty(reference), /configuration/); assert.equal(calls, before);
  } finally {
    globalThis.fetch = previous.fetch;
    for (const [name, value] of [['OFFER_MLS_LOOKUP_URL', previous.url], ['OFFER_MLS_LOOKUP_TOKEN', previous.token], ['SESSION_SECRET', previous.secret]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test('disconnected lookup is distinct from an unsuccessful MLS search', () => {
  assert.match(propertyLookupMessage('not_connected'), /not connected.*no listing details/);
  assert.doesNotMatch(propertyLookupMessage('not_connected'), /no matching|invalid|verification/);
  assert.match(propertyLookupMessage('not_found'), /search returned no matching/);
  assert.match(propertyLookupMessage('unavailable'), /could not retrieve/);
});
