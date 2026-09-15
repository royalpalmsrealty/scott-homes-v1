// Exercise the real React player with a DOM and controllable media events.
// Codec/autoplay behavior on hardware still requires a browser/device trial.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ts from 'typescript';

const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.com' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });

const source = await readFile(new URL('../src/components/home/HeroVideo.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
// Only the framework's image optimizer is replaced; the video/control is real.
const imageStub = 'data:text/javascript,' + encodeURIComponent(`import {createElement} from ${JSON.stringify(import.meta.resolve('react'))}; export default function Image({fill,priority,...props}) {return createElement('img',props);}`);
const resolved = compiled.replace(/from "([^"]+)"/g, (_, name) => `from ${JSON.stringify(name === 'next/image' ? imageStub : import.meta.resolve(name))}`);
const { HeroVideo } = await import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`);
const props = { poster: '/poster.jpg', desktopSrc: '/desktop.mp4', mobileSrc: '/phone.mp4' };
let mobile = false, reduced = false, rejectPlay = false, playCalls = 0;
const motionListeners = new Set();
window.matchMedia = query => ({
  get matches() { return query.includes('reduced-motion') ? reduced : mobile; },
  addEventListener: (_, callback) => motionListeners.add(callback),
  removeEventListener: (_, callback) => motionListeners.delete(callback),
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', { get() { return this.testPaused ?? true; } });
window.HTMLMediaElement.prototype.play = function () {
  playCalls++;
  if (rejectPlay) return Promise.reject(new DOMException('User gesture required', 'NotAllowedError'));
  this.testPaused = false;
  return Promise.resolve();
};
window.HTMLMediaElement.prototype.pause = function () {
  this.testPaused = true;
  this.dispatchEvent(new window.Event('pause'));
};

async function mount(options = {}) {
  mobile = options.mobile ?? false;
  reduced = options.reduced ?? false;
  rejectPlay = options.rejectPlay ?? false;
  playCalls = 0;
  Object.defineProperty(navigator, 'connection', { value: options.connection, configurable: true });
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(createElement(HeroVideo, props)));
  return { root, video: document.querySelector('video'), button: document.querySelector('button') };
}
async function unmount(root) { await act(async () => root.unmount()); assert.equal(motionListeners.size, 0); }
async function event(video, name) { await act(async () => video.dispatchEvent(new window.Event(name))); }

// Real mobile source is selected before playback; a ready frame is not enough
// to hide the poster when iOS denies autoplay.
let player = await mount({ mobile: true, rejectPlay: true });
assert.equal(player.video.getAttribute('src'), '/phone.mp4');
assert.equal(playCalls, 1);
assert.equal(player.video.muted, true);
assert.equal(player.video.defaultMuted, true);
assert.equal(player.video.playsInline, true);
assert.equal(player.video.loop, true);
await event(player.video, 'canplay');
assert.ok(player.video.className.includes('opacity-0'));
assert.equal(player.button.getAttribute('aria-label'), 'Play background video');
rejectPlay = false;
await act(async () => player.button.click());
assert.equal(playCalls, 2, 'Tap retries playback directly');
await event(player.video, 'playing');
assert.ok(player.video.className.includes('opacity-100'));
assert.equal(player.button.getAttribute('aria-label'), 'Pause background video');
await act(async () => player.button.click());
assert.equal(player.video.paused, true);
assert.equal(player.button.getAttribute('aria-label'), 'Play background video');
await event(player.video, 'error');
assert.ok(player.video.className.includes('opacity-0'), 'Media failure restores the poster');
await unmount(player.root);

// Respect motion/data settings automatically while retaining explicit play.
for (const options of [{ reduced: true }, { connection: { saveData: true } }, { connection: { effectiveType: '3g' } }]) {
  player = await mount({ mobile: true, ...options });
  assert.equal(playCalls, 0, 'No autoplay against visitor preferences');
  assert.equal(player.video.preload, 'none');
  await act(async () => player.button.click());
  assert.equal(playCalls, 1, 'Visitor can explicitly choose playback');
  await unmount(player.root);
}

player = await mount();
assert.equal(player.video.getAttribute('src'), '/desktop.mp4');
assert.equal(playCalls, 1);
await event(player.video, 'playing');
reduced = true;
await act(async () => { for (const listener of motionListeners) listener(); });
assert.equal(player.video.paused, true, 'Enabling reduced motion pauses an active video');
await unmount(player.root);
console.log('Hero player passed: phone/desktop sources, blocked autoplay, poster until playing, tap retry, pause, media error, reduced motion and data saver.');
