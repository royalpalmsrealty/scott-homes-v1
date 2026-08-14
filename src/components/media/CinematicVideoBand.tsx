"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A full-bleed, text-over-video moment for a single supporting clip — not a
// hero (no poster/eligibility gating for LCP), just a deliberate cinematic
// beat inside a page. Slow ambient zoom and a real mute/unmute control
// distinguish it from a plain boxed video embed.
export function CinematicVideoBand({
  src,
  eyebrow,
  heading,
  children,
}: {
  src: string;
  eyebrow: string;
  heading: string;
  children?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <section className="relative isolate flex min-h-[55vh] items-center justify-center overflow-hidden sm:min-h-[70vh]">
      <div className="absolute inset-0 bg-ink">
        {reducedMotion ? null : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="h-full w-full object-cover motion-safe:animate-[kenburns_24s_ease-in-out_infinite_alternate]"
          >
            <source src={src} type="video/webm" />
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />

      {!reducedMotion && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-ink/50 text-white backdrop-blur-md transition-colors hover:border-teal hover:bg-teal hover:text-ink sm:bottom-8 sm:right-8"
        >
          {muted ? <MutedIcon /> : <UnmutedIcon />}
        </button>
      )}

      <div className="relative z-10 mx-auto flex max-w-[900px] flex-col items-center px-4 pb-6 pt-10 text-center sm:px-6">
        <span className="text-on-video font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
          {eyebrow}
        </span>
        <h2 className="text-on-video-teal mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
          {heading}
        </h2>
        <span className="mt-5 h-px w-16 bg-gold" aria-hidden="true" />
        {children}
      </div>
    </section>
  );
}

function MutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
      <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
