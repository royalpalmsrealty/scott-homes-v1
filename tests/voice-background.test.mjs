import test from 'node:test';
import assert from 'node:assert/strict';
import { observeVoiceBackground } from '../src/lib/voiceBackground.ts';

test('background and return report once; blur does not count as standby', () => {
  const page = new EventTarget(), lifecycle = new EventTarget(), events = [];
  page.visibilityState = 'visible';
  const stop = observeVoiceBackground(page, lifecycle, () => events.push('hidden'), () => events.push('returned'));
  lifecycle.dispatchEvent(new Event('blur')); assert.deepEqual(events, []);
  page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  lifecycle.dispatchEvent(new Event('pagehide')); assert.deepEqual(events, ['hidden']);
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange'));
  lifecycle.dispatchEvent(new Event('pageshow')); assert.deepEqual(events, ['hidden', 'returned']);
  page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(events, ['hidden', 'returned', 'hidden']);
  stop();
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(events.length, 3);
});

test('page cache restoration reports recovery after a missed hide event', () => {
  const page = new EventTarget(), lifecycle = new EventTarget(), events = [];
  page.visibilityState = 'visible';
  const stop = observeVoiceBackground(page, lifecycle, () => events.push('hidden'), () => events.push('returned'));
  const restored = new Event('pageshow'); restored.persisted = true;
  lifecycle.dispatchEvent(restored);
  assert.deepEqual(events, ['hidden', 'returned']);
  stop();
});
