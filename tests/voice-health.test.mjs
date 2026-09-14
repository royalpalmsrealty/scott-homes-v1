import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceHealth } from '../src/lib/voiceHealth.ts';
import { VoiceDiagnosticSchema } from '../src/lib/voiceDiagnostics.ts';

test('silence reveals recovery without speech recognition or a frustration keyword', () => {
  let clock = 0; const health = createVoiceHealth(() => clock);
  const sample = () => health.sample({ speaking: false, muted: false });
  assert.equal(sample(), 'ready');
  clock = 14999; assert.equal(sample(), 'ready');
  clock = 15000; assert.equal(sample(), 'quiet');
  health.agentActivity(); assert.equal(sample(), 'ready');
});

test('replies have a response deadline; actual output activity resets it', () => {
  let clock = 0; const health = createVoiceHealth(() => clock);
  const sample = () => health.sample({ speaking: false, muted: false });
  health.userMessage(); assert.equal(sample(), 'waiting');
  clock = 10000; assert.equal(sample(), 'delayed');
  health.agentActivity(); assert.equal(sample(), 'ready');
  clock = 20000; health.agentActivity();
  clock = 30000; assert.equal(health.sample({ speaking: true, muted: false }), 'ready');
  clock = 40000; assert.equal(health.sample({ speaking: true, muted: false }), 'quiet');
});

test('manual mute suppresses silence prompts and restart clears pending replies', () => {
  let clock = 0; const health = createVoiceHealth(() => clock);
  health.userMessage(); clock = 60000;
  assert.equal(health.sample({ speaking: false, muted: true }), 'ready');
  health.reset(); assert.equal(health.sample({ speaking: false, muted: false }), 'ready');
});

test('diagnostics reject utterances, draft values and arbitrary error strings', () => {
  const valid = { version: 1, session: '85fb9923-7486-413a-b984-ddb2433f0bca', event: 'screen_denied', platform: 'ios', browser: 'safari_family', framed: false };
  assert.equal(VoiceDiagnosticSchema.safeParse(valid).success, true);
  for (const data of [{ ...valid, transcript: 'private words' }, { ...valid, propertyReference: 'private address' }, { ...valid, event: 'raw SDK error text' }]) {
    assert.equal(VoiceDiagnosticSchema.safeParse(data).success, false);
  }
});
