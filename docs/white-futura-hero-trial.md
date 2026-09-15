# White Futura headline trial — September 15, 2026

Scott asked which font the headline used and requested a return to white with
Futura. The prior typeface was Playfair Display, verified in `src/app/layout.tsx`
and the `font-display` token.

Only the homepage h1 receives `hero-futura`: white text, weight 500, no colored
halo, and a small dark shadow for legibility over video. Font order is Futura,
Futura-Medium, Century Gothic, existing Inter, then sans-serif. Other headings,
navigation, mobile video, overlay, and controls retain their previous behavior.

## Font availability

No Futura font file or webfont embed exists in this repository. This trial uses
the visitor's installed Futura; it does not redistribute or license font files.
Apple lists Futura Medium among its iOS/macOS system fonts:
https://developer.apple.com/fonts/system-fonts/

Devices without Futura use a fallback. Consistent Futura rendering everywhere
requires a supplied webfont or authorized Adobe Fonts web project. A CSS
font-family declaration alone does not prove the rendered font is Futura.
The user was told about this limitation before preview deployment.

## Preview and rollback

- Branch: `codex/white-futura-hero-preview`.
- Source: `f48042aed6d9e62a17f27af8ece0d21bbd59139c`.
- Deployment: `dpl_HcA7XhW1k8E9nwA45r3BWUwm53Wp`.
- Preview: `https://scott-homes-mtpcfm2uv-royalpalmsrealty1.vercel.app/`.
- Previous gold/white-glow version: `542daa4` on `codex/gold-white-glow-preview`,
  `https://scott-homes-j6m14ehw5-royalpalmsrealty1.vercel.app/`.

Prior previews and source branches are retained. Restore the h1 classes from
the preceding branch to undo this trial. No production promotion requested.

## Translucent overlay follow-up

Scott then suggested a translucent black overlay for the header. In context,
this is applied over the hero video behind the headline. The existing hero wash
increases from 8% to 20% black; the navigation bar remains in its prior style.
The white Futura selection and all video behavior are retained. Restore
`bg-ink/8` to undo only this overlay change.
