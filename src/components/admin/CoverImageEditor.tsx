"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function CoverImageEditor({
  postId,
  coverImage,
  coverImageAlt,
  title,
  onChange,
}: {
  postId: string;
  coverImage?: string;
  coverImageAlt?: string;
  title: string;
  onChange: (coverImage: string, coverImageAlt: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/blog/${postId}/cover-image`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.post.coverImage, data.post.coverImageAlt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-paper">
          {coverImage ? (
            <Image src={coverImage} alt={coverImageAlt ?? title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CameraIcon />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Cover Image</p>
          <p className="mt-0.5 truncate font-sans text-sm text-body">
            {coverImage ? "AI-generated — swap it any time" : "No image yet"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-line px-4 font-sans text-xs font-medium text-ink transition-colors hover:border-teal hover:bg-teal/10 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Uploading…
            </>
          ) : (
            "Replace Image"
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-3 font-sans text-xs text-gold-deep">{error}</p>}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
