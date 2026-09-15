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

## Ready preview

- Final source: `133a820686ce51e85f14a5c6100b3aa9ede76881`.
- Deployment: `dpl_2dD2nFtf4AYf7JxJHjXjbvts9FU8`, READY, preview.
- URL: `https://scott-homes-16y2f8s5a-royalpalmsrealty1.vercel.app/`.
- Vercel's shared preview link expires September 16, 2026 at 13:09:30 UTC;
  generate a new share link if needed, without removing deployment protection.
- Browser verified the final heading's gold shadows are rgba(150,128,46,.95)
  and rgba(150,128,46,.55), matching `#96802e`.
- Final video observed playing with duration 36.133333, no media error.
- Pause and resume were clicked successfully on the identical player in the
  preceding mobile preview (`dpl_5XhHF8AjSZwT37VTGUqG51nnABjy`).
- Full navigation, Home Worth and Make an Offer remain visible.
- Production reconfirmed at `dpl_4eeNZs8rQTH1YuUjNoLjtWPa2DGZ` with source
  `0da96fda6d863c2e52165bbc0112b2c9c7614ad8`; no hero preview was promoted.
- Automated tests cover phone source selection and denied autoplay. Browser
  playback verification used desktop Chrome; no physical iPhone test was run.
