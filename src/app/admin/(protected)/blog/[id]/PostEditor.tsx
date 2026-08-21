"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/blog/types";
import { BLOG_CATEGORIES } from "@/lib/blog/types";
import { CoverImageEditor } from "@/components/admin/CoverImageEditor";

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  draft: { label: "Draft", dot: "bg-muted", text: "text-muted", bg: "bg-line" },
  pending_approval: { label: "Pending Approval", dot: "bg-gold animate-pulse", text: "text-gold-deep", bg: "bg-gold/15" },
  published: { label: "Published", dot: "bg-teal", text: "text-teal-deep", bg: "bg-teal/15" },
};

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
  const status = STATUS_STYLES[post.status];

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

  // One clean "Publish" action from the editor's point of view — a draft
  // still passes through pending_approval underneath (store.ts only allows
  // publishPost() from that state), but that hop happens automatically here
  // instead of making the user find and click a separate button for it.
  async function handlePublish(force = false) {
    setPublishing(true);
    setError(null);
    try {
      await handleSave();

      let current = post;
      if (current.status === "draft") {
        const submitRes = await fetch(`/api/blog/${post.id}/submit`, { method: "POST" });
        const submitData = await submitRes.json();
        if (!submitRes.ok) throw new Error(submitData.error ?? "Failed to submit for approval.");
        current = submitData.post;
        setPost(current);
      }

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
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 font-sans text-sm text-teal-deep hover:underline">
          <BackIcon /> All Posts
        </Link>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium ${status.bg} ${status.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
          {status.label}
        </span>
      </div>

      {post.status === "published" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-teal/30 bg-teal/10 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-ink">
            <CheckIcon />
          </span>
          <p className="font-sans text-sm text-teal-deep">
            Live at{" "}
            <Link href={`/blog/${post.slug}`} className="font-medium underline" target="_blank">
              /blog/{post.slug}
            </Link>
          </p>
        </div>
      )}

      <div className="mt-6">
        <CoverImageEditor
          postId={post.id}
          coverImage={post.coverImage}
          coverImageAlt={post.coverImageAlt}
          title={post.title}
          onChange={(coverImage, coverImageAlt) => {
            updateField("coverImage", coverImage);
            updateField("coverImageAlt", coverImageAlt);
          }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <input
          value={post.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="block w-full border-0 border-b-2 border-line bg-transparent py-2 font-display text-3xl text-ink transition-colors focus:border-teal focus:outline-none"
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
              className="mt-1.5 block w-full rounded-lg border border-line px-3 py-2.5 font-sans text-sm text-ink transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
          </div>
          <div>
            <label className="block font-sans text-xs font-medium uppercase tracking-wide text-muted">
              Category
            </label>
            <select
              value={post.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-line px-3 py-2.5 font-sans text-sm text-ink transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
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
            className="mt-1.5 block w-full rounded-lg border border-line px-3 py-2.5 font-sans text-sm text-ink transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
          />
        </div>
      </div>

      {post.verifyWarnings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-gold-deep">
            <AlertIcon />
            {post.verifyWarnings.length} unresolved item{post.verifyWarnings.length > 1 ? "s" : ""} — the
            writer flagged these instead of guessing:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-6">
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
        <div className="mt-3 flex flex-col gap-4">
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
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 font-sans text-sm font-medium text-body transition-colors hover:border-teal hover:bg-teal/10 disabled:opacity-50"
        >
          {continuing ? (
            <>
              <Spinner /> Writing more…
            </>
          ) : (
            <>
              <SparkleIcon /> Continue Writing
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-gold/10 px-3 py-2 font-sans text-sm text-gold-deep">{error}</p>
      )}

      <div className="sticky bottom-4 mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink px-5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal disabled:opacity-50"
        >
          {saving ? <Spinner /> : null}
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt && (
          <span className="font-sans text-xs text-muted">Saved {savedAt.toLocaleTimeString()}</span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {(post.status === "draft" || post.status === "pending_approval") && !confirmForcePublish && (
            <button
              type="button"
              onClick={() => handlePublish(false)}
              disabled={publishing}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-6 font-sans text-sm font-semibold text-ink shadow-[0_8px_20px_rgba(40,188,184,0.25)] transition-transform hover:scale-[1.03] disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
            >
              {publishing ? (
                <>
                  <Spinner /> Publishing…
                </>
              ) : (
                <>
                  <RocketIcon /> Publish
                </>
              )}
            </button>
          )}

          {confirmForcePublish && (
            <div className="flex items-center gap-3 rounded-full border border-gold bg-gold/10 px-4 py-2">
              <span className="font-sans text-sm text-gold-deep">Publish with unresolved items?</span>
              <button
                type="button"
                onClick={() => handlePublish(true)}
                className="font-sans text-sm font-semibold text-gold-deep underline"
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
    <div className="rounded-xl border border-line bg-white p-4 transition-colors hover:border-teal/40">
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
          className="flex-1 rounded-full border border-line px-3 py-1.5 font-sans text-xs text-ink transition-colors focus:border-teal focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onRegenerate(instruction)}
          disabled={busy || !instruction.trim()}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 font-sans text-xs text-body transition-colors hover:border-teal hover:bg-teal/10 disabled:opacity-50"
        >
          {busy ? "Rewriting…" : "Rewrite"}
        </button>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 17.1a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" fill="currentColor" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2c2.5 2 4 5.5 4 9 0 1.5-.3 2.8-.8 4l-3.2 3-3.2-3c-.5-1.2-.8-2.5-.8-4 0-3.5 1.5-7 4-9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="1.4" fill="currentColor" />
      <path d="M9 15l-2.5 1v3l2.5-1.5M15 15l2.5 1v3l-2.5-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}
