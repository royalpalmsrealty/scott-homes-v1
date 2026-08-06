"use client";

import { useEffect, useRef, useState } from "react";
import type { FeaturedVideo } from "@/lib/featuredVideos";

function embedSrc(video: FeaturedVideo) {
  if (video.platform === "youtube") {
    // youtube-nocookie.com so no tracking cookie is set before consent;
    // rel=0/modestbranding/playsinline suppress the worst of the chrome.
    return `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  return `https://player.vimeo.com/video/${video.videoId}?autoplay=1`;
}

function PlayGlyph() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-16 sm:w-16">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="var(--ink)" />
      </svg>
    </span>
  );
}

function VideoModal({ video, onClose }: { video: FeaturedVideo; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={video.title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center text-white/70 transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={embedSrc(video)}
            title={video.title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export function VideoLightbox({
  video,
  className = "",
}: {
  video: FeaturedVideo;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative flex items-center justify-center overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal ${className}`}
        style={{ background: "linear-gradient(160deg, var(--ink) 0%, rgba(40,188,184,0.25) 100%)" }}
        aria-label={`Play video: ${video.title}`}
      >
        <PlayGlyph />
        {video.isPlaceholder && (
          <span className="absolute right-3 top-3 bg-gold px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-ink">
            Sample
          </span>
        )}
        <span className="absolute bottom-3 right-3 bg-ink/60 px-2 py-0.5 font-sans text-[10px] text-white">
          {video.duration}
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8 font-sans text-sm font-medium text-white">
          {video.title}
        </span>
      </button>

      {open && <VideoModal video={video} onClose={handleClose} />}
    </>
  );
}
