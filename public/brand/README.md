# Brand assets — drop client-supplied files here with these exact names

| File | Purpose | Used by |
|---|---|---|
| `logo.svg` | Primary lockup (stacked eye + wordmark) | Hero/marketing use, `/about` |
| `logo-horizontal.svg` | Horizontal lockup — stacked version is too tall for the sticky mobile header | `src/components/layout/Header.tsx` |
| `logo-white.svg` | White/knockout version for the dark (`--ink`) footer | `src/components/layout/Footer.tsx` |
| `eye-mark.svg` | Eye mark alone, square, min 512x512 | Favicon (`src/app/icon.png` or `.svg`) and OG image generation (`@vercel/og`) |

Once these land:

1. Swap the text wordmark in `Header.tsx` for `<Image src="/brand/logo-horizontal.svg" .../>`.
2. Swap the text wordmark in `Footer.tsx` for `<Image src="/brand/logo-white.svg" .../>`.
3. Replace `src/app/favicon.ico` and add `src/app/icon.png` (or `.svg`) from `eye-mark.svg`.
4. Get the true gold/teal hex values from the vector SVG and update `src/app/globals.css` — the
   current tokens are sampled from a JPEG and may be off (see build brief §4, §15).

Also needed before launch (not files, but data): individual and brokerage real-estate license
numbers, for `Footer.tsx` and schema.
