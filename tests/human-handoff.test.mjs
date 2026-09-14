import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldOfferHumanHelp } from '../src/lib/humanHandoff.ts';

test('direct requests, expressed frustration and the AI handoff offer reveal the call option', () => {
  for (const message of ['Can I speak to a live agent?', 'Please transfer me to Scott.', 'I am really frustrated.', 'I’m getting angry.', 'You cannot hear me.', 'Stop repeating the questions.']) {
    assert.equal(shouldOfferHumanHelp('user', message), true, message);
  }
  assert.equal(shouldOfferHumanHelp('agent', 'Would you like to speak with Scott directly?'), true);
  assert.equal(shouldOfferHumanHelp('agent', 'Tap Call Scott now to call him directly.'), true);
});

test('offer details, third-party emotions and a declined handoff do not trigger the display shortcut', () => {
  for (const message of ['No, I do not want to call Scott.', 'I am not angry.', 'The seller is angry about the inspection.', 'My real estate agent suggested seven days.', 'Yes, twenty percent.', 'I want Scott to prepare my offer.']) {
    assert.equal(shouldOfferHumanHelp('user', message), false, message);
  }
  assert.equal(shouldOfferHumanHelp('agent', 'Are you working with another real estate agent on this purchase?'), false);
});
