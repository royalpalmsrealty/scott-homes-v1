# Hero video — drop client-supplied files here with these exact names

Per build brief §7.1: the poster image is the LCP element and loads instantly; the video loads
after and cross-fades in. No video at all on slow connections or `prefers-reduced-motion`.

| File | Purpose |
|---|---|
| `hero-desktop.mp4` | 1920x1080, muted, loop-ready, no audio track needed |
| `hero-mobile.mp4` | 720x1280 portrait crop of the same footage |

Poster image (not video) goes in `../images/hero-poster.avif` (see `public/images/README.md`).

Once these land, wire into `src/app/page.tsx`'s hero section:

```tsx
<video
  poster="/images/hero-poster.avif"
  autoPlay
  muted
  loop
  playsInline
  preload="none"
>
  <source src="/video/hero-mobile.mp4" media="(max-width: 767px)" />
  <source src="/video/hero-desktop.mp4" />
</video>
```

Gate video loading behind a connection/`prefers-reduced-motion` check client-side — do not ship
the `<video>` tag unconditionally.
