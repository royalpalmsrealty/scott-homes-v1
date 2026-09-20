"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Criteria = {
  neighborhood: string;
  minBeds: number;
  minBaths: number;
  pool: boolean;
};

type JarvisContext = { criteria: Criteria; listingIds: string[] };

type SearchResults = {
  count: number;
  url: string;
  listingIds: string[];
  criteria: Criteria;
  referenceListingId?: string;
};

type UIMessage = {
  role: "user" | "assistant";
  content: string;
  results?: SearchResults | null;
};

type ConversationResponse = {
  reply?: string;
  context?: JarvisContext | null;
  results?: SearchResults | null;
  error?: string;
};

const MESSAGE_KEY = "jarvisConversationV1";
const CONTEXT_KEY = "jarvisContextV1";
const GREETING: UIMessage = {
  role: "assistant",
  content:
    "Hi, I’m JARVIS. Tell me the Key West neighborhood and minimum bedrooms and bathrooms you want.",
};

function HomeSearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.5 10v9h13v-9M9.5 19v-5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function JarvisSearchWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([GREETING]);
  const [context, setContext] = useState<JarvisContext>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem(MESSAGE_KEY);
      const savedContext = sessionStorage.getItem(CONTEXT_KEY);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedContext) setContext(JSON.parse(savedContext));
    } catch {
      sessionStorage.removeItem(MESSAGE_KEY);
      sessionStorage.removeItem(CONTEXT_KEY);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(MESSAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (context) sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  }, [context]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages: UIMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/jarvis/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
          ...(context ? { context } : {}),
        }),
      });
      const data = (await response.json()) as ConversationResponse;
      if (!response.ok || !data.reply) throw new Error(data.error ?? "JARVIS request failed");
      if (data.context) setContext(data.context);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply!, results: data.results },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I couldn’t reach the live property search. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-[140px] right-4 z-30 sm:right-6 lg:bottom-6 lg:left-6 lg:right-auto">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close JARVIS home search" : "Search homes with JARVIS"}
          aria-expanded={open}
          className="flex h-12 items-center gap-2 rounded-full bg-ink px-4 font-sans text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          {open ? <CloseIcon /> : <HomeSearchIcon />}
          <span>{open ? "Close JARVIS" : "Search Homes with JARVIS"}</span>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="JARVIS home search"
          className="fixed inset-x-0 bottom-0 z-40 flex h-[82vh] flex-col overflow-hidden rounded-t-2xl border border-line bg-white shadow-2xl sm:inset-auto sm:bottom-40 sm:right-6 sm:h-[560px] sm:max-h-[70vh] sm:w-[400px] sm:rounded-2xl lg:bottom-20 lg:left-6 lg:right-auto"
        >
          <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3 text-white">
            <div>
              <p className="font-display text-lg">JARVIS Home Search</p>
              <p className="font-sans text-[11px] text-white/70">Conversational IDX search · text preview</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close JARVIS home search"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto rounded-br-md bg-ink text-white"
                    : "rounded-bl-md border border-line bg-white text-body"
                }`}
              >
                <p>{message.content}</p>
                {message.results && (
                  <a
                    href={message.results.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-between rounded-xl bg-teal-deep px-3 py-2.5 font-semibold text-white hover:opacity-90"
                  >
                    <span>View {message.results.count} IDX {message.results.count === 1 ? "listing" : "listings"}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            ))}
            {loading && (
              <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 font-sans text-sm text-muted">
                Searching current listings…
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-line bg-white p-3">
            <label htmlFor="jarvis-search-input" className="sr-only">
              Tell JARVIS what home you want
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="jarvis-search-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={1_000}
                rows={2}
                placeholder="Example: 3 bedrooms and 2 bathrooms in Casa Marina"
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-line bg-white px-3 py-2 font-sans text-sm text-ink outline-none focus:border-teal"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-12 items-center rounded-xl bg-ink px-4 font-sans text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-2 font-sans text-[10px] text-muted">
              JARVIS searches through FlexMLS and displays consumer-permitted results through IDX.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
