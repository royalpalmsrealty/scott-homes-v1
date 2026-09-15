# Solid gold hero headline trial — September 15, 2026

Scott requested gold/mustard letters for only “Key West real estate, done
quietly.” and a comparison without the glow.

The homepage h1 now uses the shared `text-gold` brand token (`#96802e`) and no
text-shadow class. The supporting paragraph, remaining headings, full navigation,
8% video overlay, new mobile-enabled footage and playback controls retain their
previous appearance and behavior.

- Branch: `codex/gold-type-hero-preview`.
- Source: `1cf8e8e33d6200da5b948550459875f5dfe88d0c`.
- Previous complete version: `96f1ed2` on `codex/mobile-hero-preview`.
- Previous white type/gold glow preview:
  `https://scott-homes-16y2f8s5a-royalpalmsrealty1.vercel.app/`.
- New preview: `https://scott-homes-3rt2eozfz-royalpalmsrealty1.vercel.app/`.
- Deployment: `dpl_GoizN5KGgcc4Zssd7YYfUhV97GoE`.

To restore the prior look, restore the h1 classes from the preceding branch.
The existing gold glow CSS remains available for that purpose.
No production promotion is part of this comparison.

Validation: focused ESLint and whitespace validation passed. Vercel build is
READY. Browser computed style confirmed `rgb(150, 128, 46)` and `text-shadow:
none` for the h1; the full header navigation remains visible. The shared preview
link expires September 16, 2026 at 13:14:30 UTC and can be regenerated.
