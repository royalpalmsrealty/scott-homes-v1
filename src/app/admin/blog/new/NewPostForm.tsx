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
      <label htmlFor="topic" className="block font-sans text-sm font-medium text-ink">
        Topic
      </label>
      <textarea
        id="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={3}
        placeholder="e.g. What buyers should know about flood insurance on the island"
        className="mt-1.5 block w-full border border-line px-4 py-2.5 font-sans text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleGenerate(topic)}
          disabled={generating || !topic.trim()}
          className="inline-flex min-h-11 items-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate Draft"}
        </button>
        <button
          type="button"
          onClick={handleSuggestTopics}
          disabled={loadingTopics}
          className="inline-flex min-h-11 items-center border border-ink px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal disabled:opacity-50"
        >
          {loadingTopics ? "Thinking…" : "Suggest 10 Topics"}
        </button>
      </div>

      {error && <p className="mt-3 font-sans text-sm text-gold-deep">{error}</p>}

      {topics.length > 0 && (
        <div className="mt-6">
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-muted">
            Pick one
          </p>
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
                  className="w-full border border-line bg-white px-4 py-2.5 text-left font-sans text-sm text-body transition-colors hover:border-teal hover:bg-paper disabled:opacity-50"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
