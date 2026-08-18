"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPostForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggestTopics() {
    setLoadingTopics(true);
    setError(null);
    try {
      const res = await fetch("/api/blog/suggest-topics", { method: "POST" });
      const data = await res.json();
      if (data.disabled) {
        setError(data.message);
      } else {
        setTopics(data.topics ?? []);
      }
    } catch {
      setError("Couldn't reach the topic suggester. Try again.");
    } finally {
      setLoadingTopics(false);
    }
  }

  async function handleGenerate(chosenTopic: string) {
    if (!chosenTopic.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: chosenTopic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate a draft.");
        setGenerating(false);
        return;
      }
      router.push(`/admin/blog/${data.post.id}`);
    } catch {
      setError("Something went wrong generating the draft.");
      setGenerating(false);
    }
  }

  return (
    <div>
      <label htmlFor="topic" className="block font-sans text-xs font-medium uppercase tracking-wide text-muted">
        Topic
      </label>
      <textarea
        id="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={3}
        placeholder="e.g. What buyers should know about flood insurance on the island"
        className="mt-2 block w-full rounded-xl border border-line px-4 py-3 font-sans text-base text-ink placeholder:text-muted/70 transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleGenerate(topic)}
          disabled={generating || !topic.trim()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-6 font-sans text-sm font-semibold text-ink shadow-[0_8px_20px_rgba(40,188,184,0.25)] transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
        >
          {generating ? (
            <>
              <Spinner /> Generating…
            </>
          ) : (
            <>
              <SparkleIcon /> Generate Draft
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleSuggestTopics}
          disabled={loadingTopics}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-6 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal/10 disabled:opacity-50"
        >
          {loadingTopics ? (
            <>
              <Spinner /> Thinking…
            </>
          ) : (
            "Suggest 10 Topics"
          )}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-gold/10 px-3 py-2 font-sans text-sm text-gold-deep">{error}</p>
      )}

      {topics.length > 0 && (
        <div className="mt-6">
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Pick one</p>
          <ul className="mt-3 flex flex-col gap-2">
            {topics.map((t, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setTopic(t);
                    handleGenerate(t);
                  }}
                  disabled={generating}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-left font-sans text-sm text-body transition-colors hover:border-teal hover:bg-teal/10 disabled:opacity-50"
                >
                  <span>{t}</span>
                  <span className="shrink-0 text-teal-deep opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowIcon />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
        fill="currentColor"
      />
      <path d="M19 15l0.8 2.2L22 18l-2.2 0.8L19 21l-0.8-2.2L16 18l2.2-0.8L19 15z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}
