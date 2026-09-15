"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type HeroVideoProps = {
  poster: string;
  desktopSrc: string;
  mobileSrc?: string;
};

type Connection = { saveData?: boolean; effectiveType?: string };

// This player is exclusive to the homepage hero. Other background videos
// retain their existing mobile/data-saving behavior.
export function HeroVideo({ poster, desktopSrc, mobileSrc }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const saveData = connection?.saveData ||
      ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");

    // Choose before loading so phones never download the desktop video first.
    video.src = mobile && mobileSrc ? mobileSrc : desktopSrc;
    video.muted = true;
    video.defaultMuted = true;
    if (!motion.matches && !saveData) {
      // A rejected autoplay request leaves the poster and Play button visible.
      void video.play().catch(() => {});
    }

    const respectMotion = () => {
      if (motion.matches) video.pause();
    };
    motion.addEventListener("change", respectMotion);
    return () => {
      motion.removeEventListener("change", respectMotion);
      video.pause();
    };
  }, [desktopSrc, mobileSrc]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    video.muted = true;
    // Call directly within the tap, retaining iPhone's user activation.
    void video.play().catch(() => {
      setVisible(false);
      setPlaying(false);
    });
  }

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => { setVisible(true); setPlaying(true); }}
          onPause={() => setPlaying(false)}
          onError={() => { setVisible(false); setPlaying(false); }}
        />
      </div>
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause background video" : "Play background video"}
        className="absolute bottom-4 right-4 z-10 flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-black/60 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          {playing ? <path d="M3 2h3v12H3zm7 0h3v12h-3z" /> : <path d="M4 2v12l10-6z" />}
        </svg>
        {playing ? "Pause video" : "Play video"}
      </button>
    </>
  );
}
