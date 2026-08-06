"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceMicButton } from "./VoiceMicButton";

const EXAMPLES = [
  "3 bed conch house in Old Town under $2M",
  "waterfront with a dock and transient license",
  "Casa Marina condo, walk to the beach",
];

const TYPE_SPEED_MS = 45;
const DELETE_SPEED_MS = 25;
const PAUSE_MS = 1800;

function useRotatingPlaceholder(active: boolean) {
  const [text, setText] = useState(EXAMPLES[0]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!active || prefersReducedMotion) {
      setText(EXAMPLES[0]);
      return;
    }

    let exampleIndex = 0;
    let charIndex = 0;
    let phase: "typing" | "pausing" | "deleting" = "typing";
    let timeoutId: number;

    // Self-scheduling rather than setInterval — each phase needs its own
    // delay (type/pause/delete), which a fixed-interval timer can't express.
    function tick() {
      const current = EXAMPLES[exampleIndex];
      let delay = TYPE_SPEED_MS;

      if (phase === "typing") {
        charIndex += 1;
        setText(current.slice(0, charIndex));
        if (charIndex >= current.length) {
          phase = "pausing";
          delay = PAUSE_MS;
        }
      } else if (phase === "pausing") {
        phase = "deleting";
        delay = DELETE_SPEED_MS;
      } else {
        charIndex -= 1;
        setText(current.slice(0, charIndex));
        delay = DELETE_SPEED_MS;
        if (charIndex <= 0) {
          exampleIndex = (exampleIndex + 1) % EXAMPLES.length;
          phase = "typing";
        }
      }

      timeoutId = window.setTimeout(tick, delay);
    }

    timeoutId = window.setTimeout(tick, TYPE_SPEED_MS);
    return () => window.clearTimeout(timeoutId);
  }, [active]);

  return text;
}

export function HeroSearchInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const placeholder = useRotatingPlaceholder(value.length === 0 && !focused);

  function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search/ai?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="relative w-full">
      {/* Centered over the full width of the bar (not just the mic button) and
          above it, not below — below collides with the button row that sits
          right underneath with little vertical gap. */}
      {listening && (
        <div className="absolute inset-x-0 bottom-full z-10 mb-2 flex justify-center">
          <span className="whitespace-nowrap rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-white shadow-lg">
            Listening&hellip;
          </span>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex w-full items-center gap-1 rounded-full border border-white/60 bg-white/55 py-1.5 pl-4 pr-1.5 shadow-[0_10px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-2 sm:py-2 sm:pl-5"
      >
        <button
          type="submit"
          aria-label="Search"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-teal-deep transition-colors hover:text-teal sm:h-9 sm:w-9"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label="Search Key West listings in your own words"
          className="h-8 min-w-0 flex-1 border-none bg-transparent px-1 font-sans text-sm text-ink placeholder:text-body/80 focus:outline-none sm:h-9 sm:text-base"
        />
        <VoiceMicButton
          onTranscriptChange={(transcript) => setValue(transcript)}
          onSubmit={() => submit(value)}
          onListeningChange={setListening}
        />
      </form>
    </div>
  );
}
