import Image from "next/image";

function PinIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="var(--gold)"
        strokeWidth="1.3"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="var(--gold)" strokeWidth="1.3" />
    </svg>
  );
}

type NeighborhoodPhotoProps = {
  name: string;
  className?: string;
  /** Once a real photo is supplied (R6), pass it here — next/image renders
   * it directly instead of the placeholder. */
  image?: string;
  imageAlt?: string;
  /** Set when `image` is a generic licensed stock photo, not a real photo
   * of this specific place — shows a small honest label so it's never
   * mistaken for an actual depiction of the neighborhood. */
  imageIsGeneric?: boolean;
  /** Matches R6's "priority on the first two only" rule for the index/teaser grids. */
  priority?: boolean;
};

// TODO-CLIENT-ASSET: placeholder shown whenever `image` is unset — see
// src/lib/neighborhoods.ts `imageDirection` for what each real photo should
// show. Kept as an honest placeholder rather than reusing unrelated interior
// shots, which would misrepresent each area's actual character.
export function NeighborhoodPhoto({
  name,
  className = "",
  image,
  imageAlt,
  imageIsGeneric = false,
  priority = false,
}: NeighborhoodPhotoProps) {
  if (image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={image}
          alt={imageAlt ?? name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
        {imageIsGeneric && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[10px] uppercase tracking-wide text-white backdrop-blur">
            Representative Photo
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: "linear-gradient(160deg, var(--paper) 0%, rgba(40,188,184,0.08) 100%)" }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center font-display text-[3.5rem] leading-none text-ink/5 sm:text-[5rem]"
        aria-hidden="true"
      >
        {name}
      </span>
      <div className="relative flex flex-col items-center gap-2">
        <PinIcon />
        <span className="font-sans text-[10px] uppercase tracking-wide text-muted">
          Photography Pending
        </span>
      </div>
    </div>
  );
}
