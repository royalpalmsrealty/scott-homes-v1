# Neighborhood hero trial — September 15, 2026

Scott requested the next neighborhood-video test after reviewing the bird. He referred to Casa Marina; the latest supplied Dropbox link was previously labeled Truman Annex. We explicitly identified that link in the progress update and used it without relabeling the footage as Casa Marina.

## Media

- Source: Dropbox `/Videos for website/copy_39027C43-0147-4EE1-9EF5-FE8BA616773E.MOV`.
- Original: 63,446,411 bytes, 1920 × 1080 H.264, approximately 60 fps, 22.476 seconds, AAC audio.
- Preview copy: `public/video/hero-neighborhood-test.mp4`, 5,779,562 bytes, 1920 × 1080 H.264 at 30 fps, 22.467 seconds, no audio or source metadata, fast-start MP4.
- The full sequence is retained; the duration difference is frame-rate rounding.
- Footage shows homes with balconies and picket fences, palms, and a waterfront sunset.
- Matching still: `public/images/hero-neighborhood-test.jpg`, extracted at 4 seconds.

## Scope and restoration

Preview branch: `codex/neighborhood-hero-preview`. The prior bird branch remains `codex/hero-video-preview`.

Only the active hero selection changes. Layout, navigation, offer assistant, and mobile eligibility behavior are unchanged. Small mobile screens use the matching still image.

In `src/lib/siteConfig.ts`, select one of these for the exported `heroMedia`:

- `neighborhoodHeroMedia`: this neighborhood trial.
- `testHeroMedia`: the earlier bird trial.
- `originalHeroMedia`: the original live-site hero.

Every version's assets remain available in the repository. Original and bird assets, all routes, and all components were compared against the prior commit and are unchanged.

The production domain still resolved to deployment `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ` at the start of this trial. This request authorizes another preview, not a production promotion.

## Validation

- Full FFmpeg decode of the new web copy completes without errors.
- The web copy contains exactly one video stream and no audio.
