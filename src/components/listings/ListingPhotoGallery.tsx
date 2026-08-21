"use client";

import { useState } from "react";
import Image from "next/image";

export function ListingPhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--teal-deep)_0%,var(--ink)_100%)]">
        <span className="font-sans text-sm text-white/50">No photos available</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-paper">
        <Image src={photos[active]} alt={alt} fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8">
          {photos.slice(0, 16).map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-lg transition-opacity ${
                i === active ? "ring-2 ring-teal" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {photos.length > 1 && (
        <p className="mt-2 font-sans text-xs text-muted">
          {active + 1} of {photos.length} photos
        </p>
      )}
    </div>
  );
}
