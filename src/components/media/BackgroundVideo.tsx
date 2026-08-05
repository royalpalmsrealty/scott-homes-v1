"use client";

import { useState } from "react";
import Image from "next/image";
import { useVideoEligibility } from "@/lib/useVideoEligibility";

type BackgroundVideoProps = {
  poster: string;
  src: string;
  /** Pass true only for the single above-the-fold instance driving LCP. */
  priority?: boolean;
};

// Poster paints immediately (and is the LCP element when priority is set);
// the video mounts client-side only once useVideoEligibility clears it, then
// cross-fades in once it can play.
export function BackgroundVideo({ poster, src, priority = false }: BackgroundVideoProps) {
  const eligible = useVideoEligibility();
  const [ready, setReady] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image src={poster} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
      {eligible && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setReady(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
