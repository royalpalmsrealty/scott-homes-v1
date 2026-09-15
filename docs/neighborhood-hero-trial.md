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
- MP4 atom inspection confirms `moov` precedes `mdat` for progressive playback.
- ESLint passes for the updated hero configuration.

## Preview deployment

- Application commit: `6ea9aa759bc70199a063ecab1060bbbd5baa7fea`.
- Deployment: `dpl_DVXGteu5mgaBgU9DP4qXcbBPW2mz`.
- URL: https://scott-homes-62talkohh-royalpalmsrealty1.vercel.app
- Created as preview using the authenticated Vercel connector and the same pinned-source install wrapper described in `hero-video-trial.md`. The wrapper restores the exact application commit above and runs the repository's normal installation and build.
- Deployment reached READY. Build logs confirm restoration of the exact pinned source.
- Desktop browser validation shows the new video playing at 1920 × 1080, muted and looping, readyState 4, no media error. A visual review confirms the homepage text and search overlay remain readable.
- All ten primary navigation entries, Make an Offer, and the home-value link are present.
- The production domain was re-read after verification and still points to `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ`.
- Physical iPhone testing was not performed. Existing mobile still-image behavior is unchanged.
- Preview authentication remains enabled. A temporary share URL for Scott expires September 16, 2026 at 12:30 UTC; request a fresh link through the Vercel connector when needed.

## Brightness follow-up

Scott reported that the neighborhood video looked dark. Source inspection and the rendered browser styles confirmed a 28% black overlay covering the hero. The brighter trial reduces this overlay to 8% while retaining the existing text shadows and the exact same video and poster files.

The change is isolated on `codex/brighter-hero-preview`. The first neighborhood preview at `dpl_DVXGteu5mgaBgU9DP4qXcbBPW2mz` remains available for comparison and rollback. This remains preview-only.

- Brighter application commit: `ff617805445296a4b1362e94ee043146ed06a4e5`.
- Brighter deployment: `dpl_DqYfRPmYkwmiKcdExwXzsnydSae3`.
- URL: https://scott-homes-3w22hpv5f-royalpalmsrealty1.vercel.app
- Same pinned-source deployment method. Temporary share access expires September 16, 2026 at 12:37 UTC.
- Deployment completed successfully. Browser computed styles confirm 8% black overlay; the video plays without a media error. Visual review confirms brighter footage with readable headline and supporting copy, and all ten navigation entries plus the home-value and offer controls remain present. Production was verified unchanged after this review.
