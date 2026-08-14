"use client";

import { useState, type ReactNode } from "react";

export type AccordionItem = {
  question: string;
  answer: ReactNode;
};

// Generic expand/collapse list — built for long reference/FAQ content where a
// wall of paragraphs would otherwise bury the few answers a given visitor
// actually needs. Each item toggles independently (not single-open) so users
// can compare two answers side by side if they want.
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="flex flex-col border-t border-line">
      {items.map((item, index) => {
        const open = openIndexes.has(index);
        return (
          <div key={index} className="border-b border-line">
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-base font-medium text-ink transition-colors hover:text-teal-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
            >
              {item.question}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-transform duration-200 ${
                  open ? "rotate-45 border-teal text-teal-deep" : ""
                }`}
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {open && (
              <div className="max-w-[70ch] pb-6 font-sans text-sm leading-relaxed text-body [&>p+p]:mt-3 [&_ul]:mt-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
