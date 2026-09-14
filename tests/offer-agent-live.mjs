// Optional integration test: fictional text sessions, no website submission or outbound messages.
// Run explicitly with: node tests/offer-agent-live.mjs --live
import assert from 'node:assert/strict';
import { Conversation } from '@elevenlabs/client';
import { getOfferSessionDetails, getOfferDraftContext, applyAgentIntakePatch, emptyIntake, representationChoices, parseIntakePatch } from '../src/lib/offerIntake.ts';
import { getHumanHandoffGuidance, shouldOfferHumanHelp } from '../src/lib/humanHandoff.ts';
import { brand } from '../src/lib/brand.ts';
if (!process.argv.includes('--live')) throw new Error('Pass --live to start the test conversations.');
const agentId = 'agent_2101m2gd2zqde1bra29706q5n1fz';
async function runCase(name, exchanges, initialDraft = {}) {
  const selectedCase = process.argv.find(argument => argument.startsWith('--case='))?.slice(7);
  if (selectedCase && name !== selectedCase) return;
  if (process.argv.includes('--handoff-only') && !name.startsWith('Human help')) return;
  if (process.argv.includes('--spoken-gate-only') && !name.startsWith('Spoken opening')) return;
  if (process.argv.includes('--corrections-only') && name !== 'Address correction') return;
  let draft = { ...emptyIntake, representation: representationChoices.transactionBroker, ...initialDraft };
  if (process.argv.includes('--representation-only') && name !== 'Opening agent question') return;
  let session;
  let humanQuestionPending = false;
  const queue = [];
  let waiting;
  const watchdog = setTimeout(() => { console.error(`${name}: timed out`); process.exit(2); }, 60000);
  const nextMessage = () => queue.length ? Promise.resolve(queue.shift()) : new Promise(resolve => { waiting = resolve; });
  try {
    const details = getOfferSessionDetails(draft);
    session = await Conversation.startSession({
      agentId, connectionType: 'websocket', textOnly: true,
      onConversationCreated: conversation => {
        conversation.sendContextualUpdate(details.context, {contextId: 'offer-draft'});
        conversation.sendContextualUpdate(getHumanHandoffGuidance(brand.broker.name, brand.phone.display), {contextId: 'human-help'});
      },
      onDisconnect: event => { if (event.reason === "error") { console.error(event.message); process.exitCode = 1; } },
      onMessage: ({role, message}) => {
        if (role !== 'agent' && role !== 'ai') return;
        humanQuestionPending = shouldOfferHumanHelp(role, message);
        if (waiting) { const resolve = waiting; waiting = undefined; resolve(message); }
        else queue.push(message);
      },
      clientTools: {
        update_offer_draft: parameters => {
          if (humanQuestionPending) return 'No offer changes saved. A yes/no about speaking to Scott is not an intake answer. If the visitor wants Scott, direct them to Call Scott now and pause intake. If they decline, ask the next unanswered offer question.';
          const patch = parseIntakePatch(parameters);
          assert.ok(patch, 'Draft tool only uses supported fields');
          draft = applyAgentIntakePatch(draft, patch);
          return 'Buyer-stated details updated locally for this fictional test, replacing prior values. ' + (patch.propertyReference ? 'Your address is saved. MLS lookup is not connected yet, so no listing details were retrieved. No broker permission is needed to save or correct an address. ' : '') + 'They are unconfirmed and unsent. No lead, email, text or contract is created.\n\n' + getOfferDraftContext(draft);
        },
      },
    });
    const opening = await nextMessage();
    console.log(`${name} / actual opening: ${opening}`);
    for (const {message, patterns, forbidden = [], label, edit, expectedDraft, expectedDraftPatterns} of exchanges) {
      if (edit) {
        draft = { ...draft, ...edit };
        session.sendContextualUpdate(getOfferDraftContext(draft), {contextId: "offer-draft-values"});
      }
      session.sendUserMessage(message);
      const response = await nextMessage();
      console.log(`${name} / ${label}: ${response}`);
      for (const pattern of patterns) assert.match(response, pattern, label);
      for (const pattern of forbidden) assert.doesNotMatch(response, pattern, label);
      for (const [key, value] of Object.entries(expectedDraft ?? {})) assert.equal(draft[key], value, `${label}: ${key}`);
      for (const [key, patterns] of Object.entries(expectedDraftPatterns ?? {})) for (const pattern of patterns) assert.match(draft[key], pattern, `${label}: ${key}`);
      assert.doesNotMatch(response, /(?:call|contact|reach out to) Scott (?:for|to discuss).*(?:recommendation|deposit)/i);
      assert.doesNotMatch(response, /Scott (?:says|suggests|recommends)/i);
    }
  } finally {
    if (session) await session.endSession();
    clearTimeout(watchdog);
  }
}
await runCase('Opening agent question', [
  {label: 'No means proceed', message: 'This is a fictional website test. I answered No to the opening question about working with another agent. What is next?', patterns: [/property|address/i], forbidden: [/transaction broker|representing|self.represented|are you (?:already )?working with.*agent/i]},
  {label: 'Role only when asked', message: 'If Scott prepares my offer, does that mean I am representing myself?', patterns: [/transaction broker/i], forbidden: [/you (?:are|would be|will be) (?:representing yourself|self.represented)/i, /limited representation|advocat|fiduciar/i]},
  {label: 'Finish without another agency question', message: 'For this fictional test, the property is 123 Example Test Lane, Key West, Florida. Offer 1000000 dollars, escrow 20%, cash purchase, seven days inspection, seller pays title insurance, Greg Oropeza proposed subject to the payer choice, closing 20 days if no title issues, seller closes all open permits including tree permits before closing at seller expense. Buyer is Fictional Test Buyer, buyer@example.com, 2025550142. No additional requests. I already answered No to another agent at the beginning. What next?', patterns: [/review|written|form/i], forbidden: [/are you (?:already |currently )?working with.*agent|representing yourself|self.represented/i]},
]);
await runCase('Cash', [
  {label: 'Proactive deposit', message: 'This is a fictional website test. The full property address is 123 Example Test Lane, Key West, Florida. I confirm that address. My offer price is 1000000 dollars.', patterns: [/20\s*%|twenty percent/i, /10\s*%|ten percent/i, /weak/i]},
  {label: 'Inspection', message: 'Use the suggested 20% escrow. I am paying cash. What inspection period does Scott recommend?', patterns: [/7|seven/i, /15|fifteen/i, /weak/i]},
  {label: 'Title and closing company', message: 'Use seven days for inspection. Who does Scott suggest pays title insurance, and which closing company does he recommend?', patterns: [/seller/i, /Greg Oropeza/i, /(?:whoever|party|payer|paying).*(?:choos|choice)|(?:choos|choice).*(?:pay|party)/is]},
  {label: 'Cash timing', message: 'Propose seller pays title insurance and Greg Oropeza subject to the payer choice. What cash closing timeframe does Scott recommend?', patterns: [/20|twenty/i, /title/i]},
  {label: 'Permit clause', message: 'Use 20 days provided no title issues. What permit clause does Scott recommend?', patterns: [/all open permits/i, /tree permits/i, /prior to closing|before closing/i, /seller.*expense/i]},
]);
await runCase('Financed', [
  {label: 'Contingency plus closing', message: 'This is a fictional website test. The property is 456 Example Test Lane, Key West, Florida. I confirm the address. My offer is 1000000 dollars, escrow 20%, and I will use financing. What financing contingency and additional time to close does Scott recommend?', patterns: [/30|thirty/i, /15|fifteen/i, /additional|followed|after/i]},
]);
await runCase('Address correction', [
  {label: 'Request correction without replacement', message: 'I entered the wrong property address. I want to change it.', patterns: [/new|correct|address/i], forbidden: [/cannot change|can.t change|contact.*broker|permission/i]},
  {label: 'Replace address and retain price', message: 'Change the property address to 456 Corrected Example Lane, Unit 8, Key West, Florida. Keep my offer price and other answers the same.', patterns: [/address|saved|MLS|escrow|deposit/i], forbidden: [/broker verification|cannot change|can.t change|still waiting for your offer/i], expectedDraft: {propertyReference: '456 Corrected Example Lane, Unit 8, Key West, Florida', offerPrice: '1000000'}},
  {label: 'Read the latest written correction', edit: {propertyReference: '789 Latest Example Lane, Unit 2, Key West, Florida'}, message: 'I just edited the property address using the form. Tell me the property address and offer price currently saved in my draft.', patterns: [/789 Latest Example Lane/i, /(?:1,?000,?000|one million)/i], forbidden: [/123 Original|456 Corrected/], expectedDraft: {propertyReference: '789 Latest Example Lane, Unit 2, Key West, Florida', offerPrice: '1000000'}},
], {propertyReference: '123 Original Example Lane, Key West, Florida', offerPrice: '1000000'});
await runCase('Spoken opening No', [
  {label: 'Require spoken agent answer before saving address', message: 'The property is 123 Spoken Example Lane, Key West, Florida.', patterns: [/working with.*(?:agent|broker)|have.*agent/i], expectedDraft: {representation: '', propertyReference: ''}},
  {label: 'No proceeds without repeating address', message: 'No, I am not working with another agent.', patterns: [/price|offer|amount/i], forbidden: [/transaction broker|self.represented|what.*address/i], expectedDraft: {representation: representationChoices.transactionBroker, propertyReference: '123 Spoken Example Lane, Key West, Florida'}},
], {representation: ''});
await runCase('Spoken opening Yes', [
  {label: 'Yes pauses offer collection', message: 'Before we begin, I am already working with another real estate agent on this purchase.', patterns: [/coordinat|office|pause|contact/i], forbidden: [/what.*(?:price|deposit|address)/i], expectedDraft: {representation: representationChoices.otherAgent, propertyReference: ''}},
], {representation: ''});
await runCase('Spoken opening short No', [
  {label: 'Remember the address from the fixed greeting', message: '123 Short Answer Lane, Key West, Florida.', patterns: [/working with.*(?:agent|broker)|have.*agent/i], forbidden: [/what.*(?:address|property)|confirm.*address/i], expectedDraft: {representation: '', propertyReference: ''}},
  {label: 'A blank form update does not erase the spoken address', edit: {}, message: 'No.', patterns: [/price|offer|amount/i], forbidden: [/what.*(?:address|property)|confirm.*address/i], expectedDraft: {representation: representationChoices.transactionBroker, propertyReference: '123 Short Answer Lane, Key West, Florida'}},
  {label: 'Continue to escrow after price', message: 'One million dollars.', patterns: [/escrow|deposit/i, /20\s*%|twenty percent/i], forbidden: [/what.*(?:address|property)|confirm.*address/i], expectedDraft: {propertyReference: '123 Short Answer Lane, Key West, Florida'}, expectedDraftPatterns: {offerPrice: [/^1000000(?:\.00)?$/]}},
], {representation: ''});
await runCase('Human help on request', [
  {label: 'Human request takes priority before any intake question', message: 'I want to speak to a live agent. Please connect me to Scott.', patterns: [/call Scott now/i], forbidden: [/working with.*agent|what.*address|transferring you|transfer.*(?:underway|now)|Scott (?:has|will) answer/i], expectedDraft: {representation: '', propertyReference: ''}},
], {representation: ''});
await runCase('Human help when frustrated', [
  {label: 'Offer help and pause questions', message: 'This is frustrating. You keep asking me to repeat myself and I am getting upset.', patterns: [/would you like|do you want/i, /Scott/i], forbidden: [/what.*(?:address|price)|transferring you/i]},
  {label: 'Decline resumes the saved offer without altering another-agent answer', message: 'No thank you. Let us keep going with my offer.', patterns: [/deposit|escrow/i], forbidden: [/would you like.*Scott|working with another agent/i], expectedDraft: {representation: representationChoices.transactionBroker, propertyReference: '123 Fictional Example Lane, Key West, Florida', offerPrice: '1000000'}},
  {label: 'Ask again and honor a direct request', message: 'Actually, I would like to speak to Scott now.', patterns: [/call Scott now/i], forbidden: [/what.*(?:deposit|escrow)|transferring you/i]},
], {propertyReference: '123 Fictional Example Lane, Key West, Florida', offerPrice: '1000000'});
await runCase('Human help accepted', [
  {label: 'Frustration before intake still gets human help', message: 'I am upset. I have tried this several times and this is frustrating.', patterns: [/would you like|do you want/i, /Scott/i]},
  {label: 'Spoken acceptance offers the call without saving an offer answer', message: 'Yes, please.', patterns: [/call Scott now/i], forbidden: [/what.*(?:address|price)|transferring you/i], expectedDraft: {representation: '', propertyReference: ''}},
], {representation: ''});
const almostComplete = {
  propertyReference: '123 Fictional Example Lane, Key West, Florida', offerPrice: '1000000',
  deposit: '20%', financing: 'Cash', inspection: '7 days', titleInsurance: 'Seller pays title insurance',
  closingCompany: 'Greg Oropeza, subject to the title-insurance payer’s choice', closingDate: '20 days if no title issues',
  conditions: 'Seller to close all open permits, including tree permits, prior to closing at the seller’s expense.',
  buyerName: 'Fictional Buyer', buyerEmail: 'buyer@example.com',
};
for (const [name, answer, requestPattern] of [
  ['Furniture', 'Please include the dining table and six chairs.', /dining table.*six chairs|dining table.*6 chairs/i],
  ['Nothing else', 'No, nothing else.', /no additional requests/i],
]) await runCase(`Final requests ${name}`, [
  {label: 'Ask the catch-all after the last contact detail', message: 'My phone number is 2025550142.', patterns: [/special requests/i, /furniture/i, /haven.t covered/i], forbidden: [/tap review/i], expectedDraft: {buyerPhone: '2025550142'}},
  {label: 'Save the answer and retain the accepted permit clause', message: answer, patterns: [/review/i], forbidden: [/any special requests/i], expectedDraftPatterns: {conditions: [/all open permits/i, /tree permits/i, /prior to closing|before closing/i, /seller.*expense/i, requestPattern]}},
  {label: 'Proceed without repeating the catch-all', message: 'Where do I review my answers?', patterns: [/review/i], forbidden: [/any special requests|anything.*haven.t covered/i], expectedDraftPatterns: {conditions: [requestPattern, /tree permits/i]}},
], almostComplete);
console.log('Selected live text cases passed. No request was submitted.');
