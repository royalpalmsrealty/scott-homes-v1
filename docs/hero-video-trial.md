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
