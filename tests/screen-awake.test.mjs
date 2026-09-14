import test from 'node:test';
import assert from 'node:assert/strict';
import { keepScreenAwake } from '../src/lib/screenAwake.ts';

class Page extends EventTarget { visibilityState = 'visible'; }
class Lock extends EventTarget {
  released = false;
  async release() { this.released = true; this.dispatchEvent(new Event('release')); }
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('holds during intake, releases in background and reacquires on return', async () => {
  const page = new Page(), locks = [], states = [];
  const stop = keepScreenAwake(page, async () => { const lock = new Lock(); locks.push(lock); return lock; }, state => states.push(state));
  await tick();
  assert.equal(states.at(-1), 'active');
  page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  await tick(); assert.equal(locks[0].released, true);
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange'));
  await tick(); assert.equal(locks.length, 2); assert.equal(states.at(-1), 'active');
  stop(); await tick(); assert.equal(locks[1].released, true);
  page.dispatchEvent(new Event('pointerdown')); await tick(); assert.equal(locks.length, 2);
});

test('a denied initial request can recover after a tap and avoids duplicate locks', async () => {
  const page = new Page(), states = []; let calls = 0;
  const stop = keepScreenAwake(page, async () => { if (++calls === 1) throw new Error('Denied'); return new Lock(); }, state => states.push(state));
  await tick(); assert.equal(states.at(-1), 'unavailable');
  page.dispatchEvent(new Event('pointerdown')); page.dispatchEvent(new Event('pointerdown'));
  await tick(); assert.equal(calls, 2); assert.equal(states.at(-1), 'active');
  stop();
});

test('closing while acquisition is pending releases the eventual lock', async () => {
  const page = new Page(), lock = new Lock(), states = []; let resolve;
  const stop = keepScreenAwake(page, () => new Promise(done => { resolve = done; }), state => states.push(state));
  await tick(); stop(); resolve(lock); await tick();
  assert.equal(lock.released, true); assert.deepEqual(states, []);
});

test('unsupported browsers report unavailable without throwing', async () => {
  const states = []; const stop = keepScreenAwake(new Page(), undefined, state => states.push(state));
  await tick(); assert.equal(states.at(-1), 'unavailable'); stop();
});

test('voice start requires a granted lock and shares an in-flight request', async () => {
  let resolve, calls = 0;
  const stop = keepScreenAwake(new Page(), () => { calls++; return new Promise(done => { resolve = done; }); }, () => {});
  const first = stop.request(), second = stop.request();
  assert.equal(calls, 1); resolve(new Lock());
  assert.equal(await first, true); assert.equal(await second, true);
  assert.equal(await stop.request(), true); assert.equal(calls, 1);
  stop(); assert.equal(await stop.request(), false);
});

test('unsupported and denied requests block voice with distinct failure signals', async () => {
  const failures = [];
  const unsupported = keepScreenAwake(new Page(), undefined, () => {}, undefined, reason => failures.push(reason));
  assert.equal(await unsupported.request(), false); unsupported();
  const denied = keepScreenAwake(new Page(), async () => { throw new DOMException('OS refused', 'NotAllowedError'); }, () => {}, undefined, reason => failures.push(reason));
  assert.equal(await denied.request(), false); denied();
  assert.ok(failures.includes('unsupported')); assert.ok(failures.includes('denied'));
});

test('system release while visible recovers without another tap', async t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  const locks = [], states = [];
  const stop = keepScreenAwake(new Page(), async () => { const lock = new Lock(); locks.push(lock); return lock; }, state => states.push(state));
  await tick();
  await locks[0].release();
  assert.equal(states.at(-1), 'released');
  t.mock.timers.tick(999); await tick(); assert.equal(locks.length, 1);
  t.mock.timers.tick(1); await tick(); assert.equal(locks.length, 2);
  assert.equal(states.at(-1), 'active');
  stop();
  t.mock.timers.tick(60000); await tick(); assert.equal(locks.length, 2);
});

test('denials back off automatically and stop retrying in the background', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const page = new Page(); let calls = 0;
  const stop = keepScreenAwake(page, async () => { calls++; throw new Error('Low power'); }, () => {});
  await tick(); assert.equal(calls, 1);
  for (const delay of [1000, 3000, 10000, 30000, 30000]) {
    const before = calls;
    t.mock.timers.tick(delay - 1); await tick(); assert.equal(calls, before);
    t.mock.timers.tick(1); await tick(); assert.equal(calls, before + 1);
  }
  page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  t.mock.timers.tick(60000); await tick(); assert.equal(calls, 6);
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange'));
  await tick(); assert.equal(calls, 7);
  stop(); t.mock.timers.tick(60000); await tick(); assert.equal(calls, 7);
});

test('return during a pending release is recovered without duplicate requests', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const page = new Page(), lifecycle = new EventTarget();
  let finishRequest, finishRelease, calls = 0;
  const first = new Lock();
  first.release = () => new Promise(resolve => { first.released = true; finishRelease = resolve; });
  const stop = keepScreenAwake(page, () => {
    if (++calls === 1) return new Promise(resolve => { finishRequest = resolve; });
    return Promise.resolve(new Lock());
  }, () => {}, lifecycle);
  await tick(); page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  finishRequest(first); await tick();
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange'));
  lifecycle.dispatchEvent(new Event('pageshow')); lifecycle.dispatchEvent(new Event('focus'));
  assert.equal(calls, 1);
  finishRelease(); await tick(); t.mock.timers.tick(1000); await tick();
  assert.equal(calls, 2);
  stop(); lifecycle.dispatchEvent(new Event('focus')); t.mock.timers.tick(60000); await tick();
  assert.equal(calls, 2);
});

test('already released sentinels back off instead of falsely reporting protection', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0; const states = [];
  const stop = keepScreenAwake(new Page(), async () => { calls++; const lock = new Lock(); lock.released = true; return lock; }, state => states.push(state));
  await tick(); assert.deepEqual(states, ['released']);
  t.mock.timers.tick(1000); await tick(); assert.equal(calls, 2);
  t.mock.timers.tick(2999); await tick(); assert.equal(calls, 2);
  stop();
});
