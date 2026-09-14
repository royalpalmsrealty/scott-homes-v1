// Render the actual TSX component without a browser or any connected services.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import ts from 'typescript';
import { applyIntakePatch, emptyIntake, representationChoices } from '../src/lib/offerIntake.ts';

const source = await readFile(new URL('../src/components/assistant/OfferReview.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const resolved = compiled.replace(/from "([^"]+)"/g, (_, name) => `from ${JSON.stringify(name.startsWith('@/') ? new URL(`../src/${name.slice(2)}.ts`, import.meta.url).href : import.meta.resolve(name))}`);
const { OfferReview } = await import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`);
const valid = {
  ...emptyIntake, representation: representationChoices.transactionBroker,
  propertyReference: '123 Example Lane, Unit 4, Key West, FL', offerPrice: '1250000.50',
  deposit: '20%', financing: 'Cash', inspection: '7 days', titleInsurance: 'Seller pays title insurance',
  closingCompany: 'Greg Oropeza, subject to the payer’s choice', closingDate: '20 days if no title issues',
  conditions: 'Seller closes all open permits, including tree permits, before closing at seller expense.',
  buyerName: 'Fictional Buyer', buyerEmail: 'buyer@example.com', buyerPhone: '2025550142',
};
const render = (draft, overrides = {}) => load(renderToStaticMarkup(createElement(OfferReview, {
  draft, busy: false, confirmed: false, propertyPending: false,
  onChange() {}, onConfirm() {}, onPropertyBlur() {}, onSubmit() {}, ...overrides,
})));

const full = render(valid, { confirmed: true });
assert.equal(full('form[aria-label="Offer summary"]').length, 1);
assert.equal(full('[name]').length, 13);
for (const [key, value] of Object.entries(valid).filter(([key]) => key !== 'financingContingency')) {
  assert.equal(full(`[name="${key}"]`).val(), value, `${key} remains filled in`);
  assert.equal(full(`[name="${key}"]`).is(':disabled'), false, `${key} is directly editable`);
}
assert.equal(full('details').length, 0, 'Existing answers do not trigger another suggestion/choice');
assert.equal(full('[aria-invalid="true"]').length, 0);
assert.equal(full('button[type="submit"]').is(':disabled'), false);
assert.ok(!full('button').toArray().some(button => /^(Edit|Continue|Back|Review my request)$/.test(full(button).text())), 'No question wizard or second edit step');

const missing = render({ ...valid, titleInsurance: '', closingCompany: '' });
assert.equal(missing('[name]').length, 13, 'Missing answers never hide the rest of the summary');
assert.equal(missing('[aria-invalid="true"]').length, 2);
assert.equal(missing('[name="deposit"]').val(), '20%');
assert.equal(missing('[name="offerPrice"]').val(), '1250000.50');
assert.equal(missing('details').length, 2, 'Optional suggestions appear only for unanswered fields');
assert.equal(missing('details[open]').length, 0);
assert.equal(missing('button[type="submit"]').is(':disabled'), true);

const financed = render(applyIntakePatch(valid, { financing: 'Financing' }));
assert.equal(financed('[name="financingContingency"]').length, 1);
assert.equal(financed('[name="closingDate"]').val(), '');
assert.equal(financed('[aria-invalid="true"]').length, 2, 'Changed financing marks both timing answers for attention in place');

const paused = render({ ...valid, representation: representationChoices.otherAgent });
assert.equal(paused('[name="representation"]').is(':disabled'), false);
assert.equal(paused('[name="offerPrice"]').is(':disabled'), true);
assert.equal(paused('button[type="submit"]').is(':disabled'), true);
assert.equal(render(valid)('button[type="submit"]').is(':disabled'), true, 'Final confirmation is still required');
assert.equal(render(valid, { confirmed: true, propertyPending: true })('button[type="submit"]').is(':disabled'), true, 'Unresolved listing selection blocks sending');
console.log('Summary render passed: all answers editable together; only missing details marked; no repeated choices; timing, agency and confirmation guards preserved.');
