# Mobile hero preview — September 15, 2026

Scott requested the new B3168D4E clip and motion on phones. This is a separate
preview; production and all earlier previews remain available.

## Source and exports

- Dropbox: `/Videos for website/copy_B3168D4E-7EF9-4E5D-92A2-98FEFC7534FD.MOV`
- File ID: `id:OYnQ5LFvmI4AAAAAAAH-DQ`
- Source: 101,979,622 bytes, 36.133334 seconds, 1920×1080 H.264 with AAC audio.
- Verified Dropbox content hash: `f7b4a1167b083bf783da5ecd682655d9b56b4a3b02aad0abfe0a13383868b899`.
- Desktop: `public/video/hero-mobile-trial-desktop.mp4`, 9,201,969 bytes,
  1920×1080, 30 fps, 36.133333 seconds.
- Phone: `public/video/hero-mobile-trial-phone.mp4`, 3,910,352 bytes,
  1280×720, 24 fps, 36.125 seconds.
- Both exports are H.264/yuv420p MP4, silent, with the moov atom first.
  Full sequence retained; tiny duration difference is frame-rate rounding.
- Poster: `public/images/hero-mobile-trial.jpg`, source frame at 21 seconds.
- The approved 8% overlay remains unchanged.
- Scott's follow-up replaces the homepage headline's teal halo with the
  logo/microphone gold `#96802e`; white letters and dark legibility shadows remain.

## Playback

`HeroVideo` applies only to the homepage. It selects the phone source at widths
up to 767px before starting a download. Playback is muted, inline, and looping.
The poster remains until the video actually emits `playing`; `canplay` alone
does not reveal a potentially blocked/blank video.

The Play/Pause button is always available above the hero overlay. Explicit
play calls occur directly in the tap handler. Autoplay rejection preserves the
poster and Play button. Reduced motion, data saver, and slow connections skip
autoplay and retain manual playback. Enabling reduced motion pauses playback.
Other background videos retain their existing mobile restrictions.

## Rollback

Change `heroMedia` in `src/lib/siteConfig.ts` to `extendedHeroMedia`,
`neighborhoodHeroMedia`, `testHeroMedia`, or `originalHeroMedia` to restore a clip.
The prior complete version is commit `578a59e` on `codex/extended-hero-preview`.
Its ready preview is `https://scott-homes-lhrznb6gx-royalpalmsrealty1.vercel.app/`.
No previous assets were overwritten.

## Validation

- Source size and Dropbox hash verified; both exports fully decoded with FFmpeg.
- `node tests/hero-video.test.mjs` exercises the actual React player in a DOM:
  phone/desktop selection, autoplay rejection, tap retry, poster visibility,
  pause, media error, reduced motion and data saver.
- Focused ESLint and `git diff --check` passed.
- The full Next.js build passed with all routes generated and TypeScript clean.
- Physical iPhone and ChatGPT in-app browser playback still require a device
  trial. Autoplay is subject to the browser/host app's policy; manual playback
  is provided when it is denied.

Deployment and browser verification are recorded below after the preview build.
