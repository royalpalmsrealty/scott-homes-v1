"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ASSISTANT_EVENT } from "./AssistantButton";
import { OfferIntake } from "./OfferIntake";
import { CallScottLink } from "./CallScottLink";
const AgentConversation = dynamic(() => import("./AgentConversation").then(module => module.AgentConversation), { ssr: false, loading: () => <p>Loading the AI assistant…</p> });

export function AssistantPanel() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"offer" | "agent">("offer");
  const [open, setOpen] = useState(false);
  const [generation, setGeneration] = useState(0);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    function launch(event: Event) {
      const requested = (event as CustomEvent).detail;
      if (requested !== "offer" && requested !== "agent") return;
      previousFocus.current = document.activeElement as HTMLElement;
      setMode(requested); setOpen(true); dialog.current?.showModal();
    }
    window.addEventListener(ASSISTANT_EVENT, launch);
    return () => window.removeEventListener(ASSISTANT_EVENT, launch);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  function close() { dialog.current?.close(); setOpen(false); previousFocus.current?.focus(); }
  return <dialog ref={dialog} aria-labelledby="assistant-title" onCancel={e => { e.preventDefault(); close(); }} onClose={() => setOpen(false)} className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-lg overflow-hidden border-0 bg-white p-0 text-body shadow-2xl backdrop:bg-black/35">
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5"><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-deep">Royal Palms Realty</p><h2 id="assistant-title" className="font-display text-2xl">{mode === "offer" ? "Make an Offer" : "Talk to our AI"}</h2></div><button autoFocus aria-label="Close assistant" onClick={close} className="flex size-11 items-center justify-center rounded-full border border-line text-2xl">×</button></div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
        {/* Keep the typed draft in memory when closed. Voice sessions unmount. */}
        <div hidden={mode !== "offer"}><OfferIntake key={generation} active={open && mode === "offer"} /></div>
        {open && mode === "agent" && <AgentConversation />}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-3 text-xs text-muted"><CallScottLink />{mode === "offer" && <button className="min-h-11 underline" onClick={() => { if (window.confirm("Clear this offer request and start again?")) setGeneration(value => value + 1); }}>Start over</button>}</div>
    </div>
  </dialog>;
}
