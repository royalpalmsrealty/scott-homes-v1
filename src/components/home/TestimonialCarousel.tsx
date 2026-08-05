"use client";

import { useRef, useState } from "react";
import type { Testimonial } from "@/lib/testimonials";
import { Star } from "./Star";
import { TestimonialModal } from "./TestimonialModal";

const PAGE_SIZE = 2;
// Roughly what line-clamp-6 holds at this card's width/font size — past this,
// truncate and offer "Read More" rather than let the card grow to fit.
const TRUNCATE_AT = 230;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TestimonialCard({
  testimonial,
  onReadMore,
}: {
  testimonial: Testimonial;
  onReadMore: () => void;
}) {
  const isLong = testimonial.quote.length > TRUNCATE_AT;

  return (
    <div
      className="h-full p-px transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(40,188,184,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ background: "linear-gradient(135deg, var(--teal) 0%, rgba(150,128,46,0.7) 100%)" }}
    >
      <div className="relative flex h-[420px] flex-col overflow-hidden bg-ink p-6 sm:p-8">
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-15 blur-3xl"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />

        <span
          className="pointer-events-none relative block font-display text-5xl text-gold/30"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <div className="relative mt-1 flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled />
          ))}
        </div>
        <span className="sr-only">5 out of 5 stars</span>

        <p className="relative mt-4 line-clamp-6 font-display text-base italic leading-relaxed text-white/90">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        {isLong && (
          <button
            type="button"
            onClick={onReadMore}
            className="relative mt-2 self-start font-sans text-xs font-medium uppercase tracking-wide text-teal transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Read Full Review &rarr;
          </button>
        )}

        <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="min-w-0">
            <p className="truncate font-sans text-sm font-medium text-white">{testimonial.name}</p>
            {(testimonial.role || testimonial.source) && (
              <p className="mt-0.5 truncate font-sans text-xs text-white/55">
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

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const pages = chunk(testimonials, PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [modalTestimonial, setModalTestimonial] = useState<Testimonial | null>(null);
  const touchStartX = useRef<number | null>(null);

  const totalPages = pages.length;
  const currentPage = pages[pageIndex];

  function go(nextIndex: number) {
    const wrapped = (nextIndex + totalPages) % totalPages;
    setVisible(false);
    window.setTimeout(() => {
      setPageIndex(wrapped);
      setVisible(true);
    }, 180);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      go(delta > 0 ? pageIndex - 1 : pageIndex + 1);
    }
    touchStartX.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") go(pageIndex - 1);
    if (e.key === "ArrowRight") go(pageIndex + 1);
  }

  return (
    <div
      className="relative focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`grid gap-6 transition-opacity duration-200 sm:grid-cols-2 motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentPage.map((testimonial) => (
          <TestimonialCard
            key={testimonial.name}
            testimonial={testimonial}
            onReadMore={() => setModalTestimonial(testimonial)}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => go(pageIndex - 1)}
          aria-label="Previous testimonials"
          className="flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors hover:border-teal hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <ArrowIcon direction="left" />
        </button>
        <p aria-hidden="true" className="font-sans text-xs uppercase tracking-wide text-white/50">
          {pageIndex + 1} / {totalPages}
        </p>
        <button
          type="button"
          onClick={() => go(pageIndex + 1)}
          aria-label="Next testimonials"
          className="flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors hover:border-teal hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>

      <p role="status" className="sr-only">
        Showing testimonials {pageIndex + 1} of {totalPages}.
      </p>

      {modalTestimonial && (
        <TestimonialModal testimonial={modalTestimonial} onClose={() => setModalTestimonial(null)} />
      )}
    </div>
  );
}
