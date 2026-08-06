"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/blog/types";
import { BLOG_CATEGORIES } from "@/lib/blog/types";

export function PostEditor({ post: initialPost }: { post: BlogPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [busyParagraph, setBusyParagraph] = useState<number | null>(null);
  const [continuing, setContinuing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmForcePublish, setConfirmForcePublish] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paragraphs = post.body.split(/\n\s*\n/).filter((p) => p.trim());

  function updateField<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setPost((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          seoTitle: post.seoTitle,
          metaDescription: post.metaDescription,
          category: post.category,
          tags: post.tags,
          body: post.body,
          ctaText: post.ctaText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setPost(data.post);
      setSavedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerateParagraph(index: number, instruction: string) {
    if (!instruction.trim()) return;
    setBusyParagraph(index);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${post.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragraph: paragraphs[index], instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rewrite failed");

      const nextParagraphs = [...paragraphs];
      nextParagraphs[index] = data.rewritten.trim();
      updateField("body", nextParagraphs.join("\n\n"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rewrite failed.");
    } finally {
      setBusyParagraph(null);
    }
  }

  async function handleContinueWriting() {
    setContinuing(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${post.id}/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentBody: post.body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Continue failed");
      updateField("body", `${post.body}\n\n${data.continuation.trim()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Continue failed.");
    } finally {
      setContinuing(false);
    }
  }

  async function handleSubmitForApproval() {
    await handleSave();
    const res = await fetch(`/api/blog/${post.id}/submit`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setPost(data.post);
    else setError(data.error ?? "Failed to submit for approval.");
  }

  async function handlePublish(force = false) {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${post.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setConfirmForcePublish(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Publish failed");

      setPost(data.post);
      setConfirmForcePublish(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="font-sans text-sm text-teal-deep hover:underline">
          &larr; All Posts
        </Link>
        <span className="px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-muted">
          {post.status.replace("_", " ")}
        </span>
      </div>

      {post.status === "published" && (
        <p className="mt-4 border border-teal/30 bg-teal/10 px-4 py-3 font-sans text-sm text-teal-deep">
          Live at{" "}
          <Link href={`/blog/${post.slug}`} className="underline">
            /blog/{post.slug}
          </Link>
        </p>
      )}

      <input
        value={post.title}
        onChange={(e) => updateField("title", e.target.value)}
        className="mt-4 block w-full border-0 border-b border-line bg-transparent py-2 font-display text-3xl text-ink focus:border-ink focus:outline-none"
        placeholder="Post title"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-sans text-xs font-medium uppercase tracking-wide text-muted">
            SEO Title
          </label>
          <input
            value={post.seoTitle}
            onChange={(e) => updateField("seoTitle", e.target.value)}
            className="mt-1 block w-full border border-line px-3 py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-sans text-xs font-medium uppercase tracking-wide text-muted">
            Category
          </label>
          <select
            value={post.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="mt-1 block w-full border border-line px-3 py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
          >
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block font-sans text-xs font-medium uppercase tracking-wide text-muted">
          Meta Description
        </label>
        <textarea
          value={post.metaDescription}
          onChange={(e) => updateField("metaDescription", e.target.value)}
          rows={2}
          className="mt-1 block w-full border border-line px-3 py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
        />
      </div>

      {post.verifyWarnings.length > 0 && (
        <div className="mt-6 border-l-4 border-gold bg-gold/10 px-4 py-3">
          <p className="font-sans text-sm font-medium text-gold-deep">
            {post.verifyWarnings.length} unresolved item{post.verifyWarnings.length > 1 ? "s" : ""} —
            the writer flagged these instead of guessing:
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {post.verifyWarnings.map((w, i) => (
              <li key={i} className="font-sans text-sm text-gold-deep">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Body</p>
        <div className="mt-2 flex flex-col gap-4">
          {paragraphs.map((paragraph, i) => (
            <ParagraphEditor
              key={i}
              paragraph={paragraph}
              busy={busyParagraph === i}
              onChange={(text) => {
                const next = [...paragraphs];
                next[i] = text;
                updateField("body", next.join("\n\n"));
              }}
              onRegenerate={(instruction) => handleRegenerateParagraph(i, instruction)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleContinueWriting}
          disabled={continuing}
          className="mt-4 border border-line px-4 py-2 font-sans text-sm text-body transition-colors hover:border-teal hover:bg-paper disabled:opacity-50"
        >
          {continuing ? "Writing more…" : "Continue Writing"}
        </button>
      </div>

      {error && <p className="mt-4 font-sans text-sm text-gold-deep">{error}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex min-h-11 items-center border border-ink px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt && (
          <span className="font-sans text-xs text-muted">Saved {savedAt.toLocaleTimeString()}</span>
        )}

        {post.status === "draft" && (
          <button
            type="button"
            onClick={handleSubmitForApproval}
            className="inline-flex min-h-11 items-center bg-gold px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            Submit for Approval
          </button>
        )}

        {post.status === "pending_approval" && !confirmForcePublish && (
          <button
            type="button"
            onClick={() => handlePublish(false)}
            disabled={publishing}
            className="inline-flex min-h-11 items-center bg-teal px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        )}

        {confirmForcePublish && (
          <div className="flex items-center gap-3 border border-gold bg-gold/10 px-4 py-2">
            <span className="font-sans text-sm text-gold-deep">Publish with unresolved items?</span>
            <button
              type="button"
              onClick={() => handlePublish(true)}
              className="font-sans text-sm font-medium text-gold-deep underline"
            >
              Yes, publish anyway
            </button>
            <button
              type="button"
              onClick={() => setConfirmForcePublish(false)}
              className="font-sans text-sm text-muted underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ParagraphEditor({
  paragraph,
  busy,
  onChange,
  onRegenerate,
}: {
  paragraph: string;
  busy: boolean;
  onChange: (text: string) => void;
  onRegenerate: (instruction: string) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const isHeading = paragraph.trim().startsWith("## ");

  return (
    <div className="border border-line bg-white p-3">
      <textarea
        value={paragraph}
        onChange={(e) => onChange(e.target.value)}
        rows={isHeading ? 1 : 3}
        className={`block w-full resize-none border-0 bg-transparent font-sans text-sm text-ink focus:outline-none ${isHeading ? "font-semibold" : ""}`}
      />
      <div className="mt-2 flex items-center gap-2">
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. make this shorter"
          className="flex-1 border border-line px-2 py-1 font-sans text-xs text-ink focus:border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onRegenerate(instruction)}
          disabled={busy || !instruction.trim()}
          className="shrink-0 border border-line px-3 py-1 font-sans text-xs text-body transition-colors hover:border-teal hover:bg-paper disabled:opacity-50"
        >
          {busy ? "Rewriting…" : "Rewrite"}
        </button>
      </div>
    </div>
  );
}
