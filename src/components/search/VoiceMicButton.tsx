"use client";

import { useEffect, useRef, useState } from "react";

// Minimal ambient typing for the two vendor-prefixed globals — no @types
// package ships these since the Web Speech API was never standardized.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = {
  results: { isFinal: boolean; [0]: SpeechRecognitionResultLike; length: number }[];
};
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

const DENIED_KEY = "voiceSearchDenied";

function getRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// idle: gold mic, tap to start.
// listening: black Stop + teal Send, mic stays open.
// stopped: recognition ended (Stop tapped, or it timed out on its own) but
// the transcript is still sitting in the box — mic becomes a single Send
// button so the recorded message can be sent, instead of reverting to idle.
type Phase = "idle" | "listening" | "stopped";

export function VoiceMicButton({
  onTranscriptChange,
  onSubmit,
  onListeningChange,
}: {
  onTranscriptChange: (text: string) => void;
  /** Submits whatever's currently in the search box — reads the parent's own live value, not a stale copy. */
  onSubmit: () => void;
  /** So the parent can show its own "Listening…" indicator positioned over the whole search bar. */
  onListeningChange?: (listening: boolean) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [deniedMessage, setDeniedMessage] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Finalized words only ever get appended to, never rebuilt from
  // event.results — some browsers are inconsistent about keeping every
  // earlier result in that array once recognition has run a while, and
  // rebuilding from it on every event risks silently dropping already-heard
  // words.
  const finalTranscriptRef = useRef("");
  const finalizedCountRef = useRef(0);

  useEffect(() => {
    setSupported(getRecognitionConstructor() !== null);
  }, []);

  function startListening() {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    // Keeps the mic open through pauses between words/phrases instead of
    // stopping at the first silence — the user decides when they're done.
    recognition.continuous = true;

    recognition.onresult = (event) => {
      for (let i = finalizedCountRef.current; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += (finalTranscriptRef.current ? " " : "") + result[0].transcript;
          finalizedCountRef.current = i + 1;
        }
      }
      const last = event.results[event.results.length - 1];
      const interim = last && !last.isFinal ? last[0].transcript : "";
      onTranscriptChange([finalTranscriptRef.current, interim].filter(Boolean).join(" "));
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        if (!sessionStorage.getItem(DENIED_KEY)) {
          sessionStorage.setItem(DENIED_KEY, "1");
          setDeniedMessage(true);
        }
      }
      onListeningChange?.(false);
      setPhase("idle");
    };

    recognition.onend = () => {
      onListeningChange?.(false);
      // Recognition can end on its own (browser timeout) as well as via the
      // Stop button — either way, if anything was captured, offer Send
      // rather than dropping straight back to a bare mic.
      setPhase(finalTranscriptRef.current ? "stopped" : "idle");
    };

    finalTranscriptRef.current = "";
    finalizedCountRef.current = 0;
    recognitionRef.current = recognition;
    setPhase("listening");
    onListeningChange?.(true);
    recognition.start();
  }

  function stopListening() {
    // onend (above) takes it from here — moves to "stopped" if there's a transcript, "idle" otherwise.
    recognitionRef.current?.stop();
  }

  function sendAndReset() {
    onSubmit();
    finalTranscriptRef.current = "";
    finalizedCountRef.current = 0;
    onListeningChange?.(false);
    setPhase("idle");
  }

  if (!supported) return null;

  if (phase === "idle") {
    return (
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={startListening}
          aria-label="Search by voice"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-colors hover:bg-gold-deep sm:h-9 sm:w-9"
        >
          <MicIcon />
        </button>

        {deniedMessage && (
          <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 bg-white p-3 text-xs text-body shadow-lg" role="status">
            Microphone access was denied — you can still type your search above.
            <button
              type="button"
              onClick={() => setDeniedMessage(false)}
              className="mt-1 block font-medium text-teal-deep"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === "stopped") {
    return (
      <button
        type="button"
        onClick={sendAndReset}
        aria-label="Send voice search"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-ink transition-colors hover:bg-teal-deep sm:h-9 sm:w-9"
      >
        <SendIcon />
      </button>
    );
  }

  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={stopListening}
        aria-label="Stop listening"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors sm:h-9 sm:w-9"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-teal/50" aria-hidden="true" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="relative">
          <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => {
          recognitionRef.current?.stop();
          sendAndReset();
        }}
        aria-label="Send voice search now"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-ink transition-colors hover:bg-teal-deep sm:h-9 sm:w-9"
      >
        <SendIcon />
      </button>

      <div role="status" aria-live="polite" className="sr-only">
        Listening. Tap Send to search now, or Stop to end listening and review the text first.
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l16-8-6.5 16-2.8-7.2L4 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
