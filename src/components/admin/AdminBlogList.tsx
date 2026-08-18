"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/blog/types";

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; ring: string }> = {
  draft: { label: "Draft", dot: "bg-muted", text: "text-muted", ring: "border-line" },
  pending_approval: {
    label: "Pending Approval",
    dot: "bg-gold animate-pulse",
    text: "text-gold-deep",
    ring: "border-gold/30",
  },
  published: { label: "Published", dot: "bg-teal", text: "text-teal-deep", ring: "border-teal/30" },
};

export function AdminBlogList({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setDeletingId(post.id);
    try {
      const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
        <p className="font-display text-lg text-ink">No posts yet</p>
        <p className="mt-1 font-sans text-sm text-muted">Generate your first draft to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => {
        const status = STATUS_STYLES[post.status];
        return (
          <div
            key={post.id}
            className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${status.ring}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-ink">{post.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs text-muted">
                <span>{post.category}</span>
                <span aria-hidden="true">·</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.verifyWarnings.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-medium text-gold-deep">
                    {post.verifyWarnings.length} unresolved
                  </span>
                )}
              </p>
            </div>

            <span className={`hidden shrink-0 items-center gap-1.5 font-sans text-xs font-medium sm:flex ${status.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
              {status.label}
            </span>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/blog/${post.id}`}
                className="inline-flex h-9 items-center rounded-full border border-line px-4 font-sans text-xs font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(post)}
                disabled={deletingId === post.id}
                aria-label={`Delete ${post.title}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-gold/15 hover:text-gold-deep disabled:opacity-50"
              >
                {deletingId === post.id ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <TrashIcon />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
