# Hero text band — September 15, 2026

Scott clarified the overlay should match the address/title treatment in
IMG_6969.jpeg: a horizontal translucent strip only behind the text. The previous
whole-video overlay misunderstood that request.

Removed the full-video black overlay. A 35% black strip now runs across the hero
behind only the headline and supporting paragraph, with 20px vertical padding.
Its height follows the wrapped text on narrower screens. Search and quick-action
buttons remain outside the strip. Video outside the strip has no overlay.

White type, the Futura-first font stack, and the mobile player remain unchanged.
Futura uses the visitor's installed font; it is not bundled as a webfont.

- Branch: `codex/hero-text-band-preview`.
- Source: `58e3896ec54766c1f9d8c948affdb66cf53cd107`.
- Deployment: `dpl_DFLCSZvr4J4uVRQbd3sFnYzvxNwR`.
- Preview: `https://scott-homes-pcgoqnbnt-royalpalmsrealty1.vercel.app/`.
- Prior whole-video overlay: `7af4a6d` on `codex/white-futura-hero-preview`.

No production promotion. Prior branches, previews and videos are retained.
Focused ESLint and whitespace validation passed.

During the build Scott asked whether the headline should be in caps. The
recommendation was “KEY WEST REAL ESTATE” in caps with “done quietly.” below in
sentence case. This preview preserves the existing capitalization pending his
choice; only the requested text-band correction is implemented.

Verification: deployment READY; browser found zero full-hero overlays. The band
rendered at 35% black from y=360 to y=622, enclosing both text elements; the
search input began at y=663, outside the band. Screenshot confirmed the strip
and bright surrounding video with the complete navigation. Share access expires
September 16, 2026 at 13:27:58 UTC and can be regenerated.
