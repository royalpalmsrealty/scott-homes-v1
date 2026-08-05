"use client";

import { useEffect, useRef } from "react";
import type { Testimonial } from "@/lib/testimonials";
import { Star } from "./Star";

export function TestimonialModal({
  testimonial,
  onClose,
}: {
  testimonial: Testimonial;
  onClose: () => void;
}) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-modal-name"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-teal/30 bg-ink p-8 sm:p-10"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="pointer-events-none block font-display text-6xl text-gold/30" aria-hidden="true">
          &ldquo;
        </span>

        <div className="-mt-4 flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled />
          ))}
        </div>

        <p className="mt-5 max-w-none font-display text-lg italic leading-relaxed text-white/90 sm:text-xl">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="min-w-0">
            <p id="testimonial-modal-name" className="font-sans text-sm font-medium text-white">
              {testimonial.name}
            </p>
            {(testimonial.role || testimonial.source) && (
              <p className="mt-0.5 font-sans text-xs text-white/55">
                {testimonial.role ?? testimonial.source}
              </p>
            )}
          </div>
          {testimonial.source && (
            <div className="shrink-0 text-right">
              <p className="font-sans text-xs text-white/55">{testimonial.source}</p>
              {testimonial.timeAgo && (
                <p className="mt-0.5 font-sans text-xs text-white/55">{testimonial.timeAgo}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
