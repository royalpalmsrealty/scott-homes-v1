# Uppercase headline with separate tagline — September 15, 2026

Scott approved the text-only overlay and asked to try the suggested typography:
“KEY WEST REAL ESTATE” in capitals, with “done quietly.” on its own line below.

The main line has gentle 0.04em letter spacing. The tagline is 72% of the main
type size, normal weight, and separated by an 8px gap. Main type retains the
existing responsive sizes and can wrap naturally on narrow phones. Both lines
stay within a single h1 and inside the approved 35% translucent text band.

The white text and Futura-first system font stack remain. Futura is used where
installed, with fallback fonts elsewhere; no Futura webfont is bundled.
The supporting paragraph, video, search, actions and navigation are unchanged.

- Branch: `codex/hero-caps-preview`.
- Source: `4e713e570041263ab1c075a25e83e844a9932a57`.
- Deployment: `dpl_eAst1CZG9enZxbjM2oKPZnZECNnf`.
- Preview: `https://scott-homes-8lsplsseq-royalpalmsrealty1.vercel.app/`.
- Prior approved text band: `e91d3ed` on `codex/hero-text-band-preview`.
- Prior preview: `https://scott-homes-pcgoqnbnt-royalpalmsrealty1.vercel.app/`.

Restore the h1 contents from the preceding branch to undo this typography
trial. Prior previews and assets are retained. No production promotion.

Validation: focused ESLint and whitespace validation passed; Vercel deployment
READY. Browser confirmed the uppercase line at 60px/500 and the separate tagline
at 43.2px/400 with an 8px gap on desktop. Screenshot reviewed: the title fits on
one desktop line, the approved 35% text-only band remains, and the full header is
present. No full-hero overlay exists. Shared preview access expires September 16,
2026 at 13:32:45 UTC and can be regenerated.
