# Extended hero trial — September 15, 2026

Scott supplied a longer edited video and asked to try it, acknowledging its length. Preserve the full sequence for this preview and retain the brighter 8% hero overlay.

## Source and web copy

- Source: Dropbox `/Videos for website/copy_6F0E7A2A-EFB9-4ACD-A319-F64911AB90DF.MOV`.
- Verified original: 104,699,618 bytes, 37.103991 seconds, 1920 × 1080 H.264 at approximately 60 fps with AAC audio.
- Dropbox content hash verified: `8603653c1d0b2c4673a39ef74041a0ccb1447136876d53a370a58cc35d1e0a29`.
- An initial local copy was incomplete and excluded. A fresh download passed both the expected size and Dropbox content-hash validation before conversion.
- Web copy: `public/video/hero-extended-test.mp4`, 9,442,633 bytes, 37.100 seconds, 1920 × 1080 H.264 at 30 fps, no audio or source metadata, fast-start MP4. Only frame-rate rounding changes the duration; no scenes were trimmed.
- Poster: `public/images/hero-extended-test.jpg`, extracted at 5 seconds.
- Reviewed samples show neighborhood homes, tropical landscaping, an arched entrance, tennis courts, and white balconies. No black intervals lasting 0.2 seconds or longer were detected in the source.

## Scope and restoration

- Branch: `codex/extended-hero-preview`, based on the brighter trial.
- Active preset: `extendedHeroMedia` in `src/lib/siteConfig.ts`.
- Select `neighborhoodHeroMedia` to return to the previous shorter neighborhood clip, `testHeroMedia` for the bird, or `originalHeroMedia` for the original video. All prior media files remain intact.
- The 8% overlay, full navigation, offer assistant, and mobile still-image behavior are unchanged.
- The previous brighter preview remains available at deployment `dpl_DqYfRPmYkwmiKcdExwXzsnydSae3`.
- Production initially resolved to `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ`. This request authorizes a preview, not promotion to production.

## Validation

- Optimized media passed a complete FFmpeg decode and contains exactly one video stream with no audio.
- MP4 atom order confirms `moov` precedes `mdat` for progressive playback.
- Output copies were verified against the encoded files before placement in the repository.
- ESLint passes for the changed configuration.

## Preview deployment

- Application commit: `8dc564568ca1f0a94c59db35ba8b1d3b0cbaf2d9`.
- Deployment: `dpl_6TDnyDV1eEWafwFdUeeLp9s4Ag7q`.
- URL: https://scott-homes-lhrznb6gx-royalpalmsrealty1.vercel.app
- Created as a preview through the authenticated Vercel connector. The installation wrapper restores the public GitHub archive pinned to the exact application commit, runs `npm ci --include=dev`, and then runs the repository's normal build. This matches the prior preview deployment approach and makes no project-wide settings changes.
- Build completed successfully. Browser validation shows the 37.1-second video playing at 1920 × 1080, muted, looping, readyState 4, and no media error. Computed styles confirm the retained 8% overlay. Text and search remain readable in the inspected frame.
- All ten primary navigation entries, Make an Offer, and the home-value link remain present.
- The production domain was re-read after playback verification and still points to `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ`.
- A temporary preview share link expires September 16, 2026 at 12:52 UTC. Protection remains enabled; request a fresh link through the Vercel connector if required.
- Physical iPhone testing was not performed. Existing mobile still-image behavior remains unchanged.
