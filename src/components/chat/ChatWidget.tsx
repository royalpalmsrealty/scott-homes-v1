"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";
import { openCalendlyPopup } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";
import type { Listing } from "@/lib/listings/provider";

type UIMessage = {
  role: "user" | "assistant";
  content: string;
  listings?: Listing[];
};

type ClientAction =
  | { type: "listings"; listings: Listing[] }
  | { type: "listing"; listing: Listing }
  | { type: "open_scheduling"; prefill: { name?: string; email?: string } };

const STORAGE_KEY = "chatConversation";
const NUDGE_KEY = "chatNudgeShown";
const NUDGE_DELAY_MS = 45_000;
const EVER_OPENED_KEY = "chatEverOpened";

const GREETING: UIMessage = {
  role: "assistant",
  content: `Hi, I'm the Royal Palms Realty assistant — I can help you search listings, learn about neighborhoods, or get you in touch with ${brand.broker.name}. What can I help with?`,
};

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l16-8-6.5 16-2.8-7.2L4 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16v10H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  // Keeps the launcher pulsing so it's easy to spot on a busy page — stops
  // for good the moment the visitor actually opens it once this session.
  const [everOpened, setEverOpened] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEverOpened(Boolean(sessionStorage.getItem(EVER_OPENED_KEY)));
  }, []);

  function openChat() {
    setOpen(true);
    setShowNudge(false);
    if (!everOpened) {
      setEverOpened(true);
      sessionStorage.setItem(EVER_OPENED_KEY, "1");
    }
  }

  // Restore conversation for this session.
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Desktop-only nudge, once per session, 45s in, never again if dismissed.
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop || sessionStorage.getItem(NUDGE_KEY) || open) return;

    const timer = window.setTimeout(() => {
      if (!open) setShowNudge(true);
      sessionStorage.setItem(NUDGE_KEY, "1");
    }, NUDGE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [open]);

  function dismissNudge() {
    setShowNudge(false);
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: UIMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      const assistantMessage: UIMessage = { role: "assistant", content: data.reply };
      const actions: ClientAction[] = data.clientActions ?? [];

      for (const action of actions) {
        if (action.type === "listings") assistantMessage.listings = action.listings;
        if (action.type === "open_scheduling") {
          openCalendlyPopup(action.prefill, "chatbot");
        }
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Something went wrong on my end. Call ${brand.broker.name} directly at ${brand.phone.display}.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher — sits above the mobile sticky bar (56px tall), corner-anchored on desktop.
          Pulses continuously until the visitor opens it once this session, so it's
          easy to spot on a page with a lot going on, then settles down for good. */}
      <div className="fixed bottom-[72px] right-4 z-30 sm:right-6 lg:bottom-6">
        {!open && !everOpened && (
          <span
            className="absolute inset-0 -z-10 animate-ping rounded-full motion-reduce:hidden"
            aria-hidden="true"
            style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
          />
        )}
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label={open ? "Close chat" : "Chat with us"}
          aria-expanded={open}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-ink shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 ${
            !open && !everOpened ? "motion-safe:animate-[chat-pop_2.2s_ease-in-out_infinite]" : ""
          }`}
          style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
        >
          <ChatIcon open={open} />
        </button>
      </div>

      {showNudge && !open && (
        <div className="fixed bottom-[140px] right-4 z-30 max-w-xs rounded-2xl border border-line bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)] sm:right-6 lg:bottom-24">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal-deep">
              <SparkleIcon />
            </span>
            <p className="font-sans text-sm text-body">
              Have a question about Key West real estate? I&rsquo;m happy to help.
            </p>
          </div>
          <div className="mt-3 flex gap-3 pl-10">
            <button
              type="button"
              onClick={openChat}
              className="font-sans text-sm font-medium text-teal-deep hover:underline"
            >
              Open chat
            </button>
            <button
              type="button"
              onClick={dismissNudge}
              className="font-sans text-sm text-muted hover:text-body"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Chat with Royal Palms Realty"
          className="fixed inset-x-0 bottom-0 z-30 flex h-[85vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:inset-auto sm:bottom-24 sm:right-4 sm:h-[600px] sm:max-h-[80vh] sm:w-96 sm:rounded-2xl sm:right-6"
        >
          {/* Signature two-tone accent, same teal-into-gold used on the footer. */}
          <span
            className="h-[3px] w-full shrink-0"
            aria-hidden="true"
            style={{ background: "linear-gradient(90deg, var(--teal) 0%, var(--gold) 100%)" }}
          />

          {/* Drag handle — visual affordance for the mobile sheet; closes on tap for now. */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="flex h-6 w-full shrink-0 items-center justify-center sm:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          </button>

          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink"
                style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
                aria-hidden="true"
              >
                <SparkleIcon />
              </span>
              <div>
                <p className="font-display text-base text-ink">{brand.brokerage}</p>
                <p className="font-sans text-[11px] text-muted">AI Assistant — not {brand.broker.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={brand.phone.href}
                aria-label={`Call ${brand.broker.name} directly`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-teal-deep transition-colors hover:bg-teal/10"
                title={`Talk to a human: ${brand.phone.display}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6.6 10.8C8.1 13.8 10.2 15.9 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.5 21.4 2.6 13.5 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="hidden h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink sm:flex"
              >
                <ChatIcon open />
              </button>
            </div>
          </div>

          <p className="bg-teal/8 px-4 py-2 font-sans text-[11px] text-teal-deep">
            {brand.broker.name} isn&rsquo;t in this chat — this is an AI assistant.
          </p>

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-paper/40 px-4 py-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex items-start gap-2"
                  }
                >
                  {message.role === "assistant" && (
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink"
                      style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
                      aria-hidden="true"
                    >
                      <SparkleIcon />
                    </span>
                  )}
                  <div className={message.role === "user" ? "max-w-[85%]" : "max-w-[85%]"}>
                    <div
                      className={
                        message.role === "user"
                          ? "rounded-2xl rounded-br-md bg-ink px-4 py-2.5 font-sans text-sm text-white shadow-sm"
                          : "rounded-2xl rounded-tl-md bg-white px-4 py-2.5 font-sans text-sm text-body shadow-sm ring-1 ring-line"
                      }
                    >
                      {message.role === "assistant" ? (
                        <ChatMarkdown text={message.content} />
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.listings && message.listings.length > 0 && (
                      <div className="mt-3 grid gap-4">
                        {message.listings.map((listing) => (
                          <div key={listing.id} className="max-w-full">
                            <PropertyCard listing={listing} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink"
                    style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
                    aria-hidden="true"
                  >
                    <SparkleIcon />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-line">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2 border-t border-line bg-white p-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about listings, neighborhoods…"
              className="h-10 flex-1 rounded-full border border-line bg-paper px-4 font-sans text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-ink transition-colors hover:bg-teal-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              <SendIcon />
            </button>
          </form>
          <p className="px-3 pb-3 text-center font-sans text-[11px] text-muted">
            Prefer to talk to a person?{" "}
            <Link href="/contact" className="text-teal-deep hover:underline">
              Contact {brand.broker.name}
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
