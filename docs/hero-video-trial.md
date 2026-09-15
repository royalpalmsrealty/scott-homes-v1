# Hero video trial — September 15, 2026

Scott requested a test of Dropbox `/Videos for website/IMG_6950.mov` and an easy way to switch back.

## Scope

Preview only. Preserve the homepage layout, header, offer assistant, and current mobile still-image behavior.

- Source: 140,319,169 bytes, 3840 × 2160 H.264 MOV, 30.853 seconds, with audio and metadata streams.
- Web copy: `public/video/hero-seagull-test.mp4`, 7,892,196 bytes, 1920 × 1080 H.264, 24 fps, 30.833 seconds, no audio or source metadata, fast-start MP4.
- Matching poster: `public/images/hero-seagull-test.jpg` extracted at 0.5 seconds.
- Source was not modified. The small duration difference is frame-rate rounding.
- Video displays a seagull beside water. It is not a property tour.

## Restore

In `src/lib/siteConfig.ts`, change the active assignment to:

```ts
export const heroMedia: HeroMedia = originalHeroMedia;
```

The original `/video/hero.mp4` and `/images/hero-poster.jpg` are retained unchanged. No re-upload is needed.

The pre-test source is commit `fb005ecb43a3dfab2dd530ad253b5a3911fc66fb`, preserved on `codex/before-hero-video-test`. The trial uses `codex/hero-video-preview`.

Before this test, the production domain resolved to deployment `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ` (source `0da96fda6d863c2e52165bbc0112b2c9c7614ad8`). Do not promote the trial without Scott requesting it. If it is later promoted, that retained deployment is the immediate full-site rollback option; selecting `originalHeroMedia` restores only the hero while preserving later changes.

## Preview deployment

- Application source: `7a31f2f95521f3e4e0b2b8f6c58c1ab3b6c991e8`.
- Preview deployment: `dpl_FGfv2qKqVmphyywZNpDs17jPNj3R`.
- URL: https://scott-homes-dx421x96j-royalpalmsrealty1.vercel.app
- Created through the authenticated Vercel connector, targeting preview. The local Vercel CLI no longer had credentials; the GitHub CLI authorization remained valid.
- The connector accepts deployment files rather than Git source. A small install wrapper downloads the public GitHub archive pinned to the exact application commit above, extracts it, and runs `npm ci --include=dev`. Vercel then runs the repository's normal build. Build logs confirm the exact source commit restored. This wrapper is deployment packaging, not an application change or project-wide setting change.
- Both trial and pre-trial branches were pushed successfully to GitHub.
- Media validation: complete FFmpeg decode passes; exactly one H.264 video stream, no audio; MP4 `moov` precedes `mdat` for progressive playback.
- ESLint passes for the changed configuration. Original hero assets, all application routes, and all components match the pre-trial commit.
- Vercel build completed and deployment reached READY. Desktop browser verification shows the new 1920 × 1080 video playing, muted, looping, readyState 4, and no media error. Homepage text and search remain legible. All ten primary navigation entries, home-value link, and Make an Offer button are present.
- Production was re-read after preview validation and still points to `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ`.
- Mobile video behavior was not changed: screens under 768px show the matching poster. Physical iPhone playback was not tested.
- Vercel Authentication protects the preview. A temporary share URL was created for Scott; it expires September 16, 2026 at 12:19 UTC. Request a fresh share URL through the Vercel connector if needed; do not disable deployment protection.
