"use client";

import { useRef, useState, type DragEvent } from "react";
import type { KnowledgeBaseFile } from "@/lib/ai/knowledgeBase";

const STATUS_STYLES: Record<KnowledgeBaseFile["status"], { label: string; dot: string; text: string }> = {
  processing: { label: "Processing", dot: "bg-gold animate-pulse", text: "text-gold-deep" },
  ready: { label: "Ready", dot: "bg-teal", text: "text-teal-deep" },
  failed: { label: "Failed", dot: "bg-ink", text: "text-muted" },
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(filename: string) {
  const match = filename.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : "FILE";
}

export function KnowledgeBaseManager({
  initialFiles,
  configured,
}: {
  initialFiles: KnowledgeBaseFile[];
  configured: boolean;
}) {
  const [files, setFiles] = useState(initialFiles);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(fileList: FileList | File[]) {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/knowledge-base", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? `Couldn't upload ${file.name}.`);
          continue;
        }
        setFiles((prev) => [...prev, data.file]);
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/knowledge-base/${id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function refreshStatuses() {
    const res = await fetch("/api/admin/knowledge-base");
    const data = await res.json().catch(() => null);
    if (data?.files) setFiles(data.files);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (!configured || uploading) return;
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/10 p-8 text-center">
        <p className="font-display text-lg text-ink">Not fully connected yet</p>
        <p className="mt-2 font-sans text-sm text-body">
          This needs both{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">OPENAI_API_KEY</code> and{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">SUPABASE_URL</code> /{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> set to
          enable document uploads. The chatbot itself is unaffected — this only gates the knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-teal bg-teal/10" : "border-line bg-paper hover:border-teal/50"
        }`}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full text-ink"
          style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
        >
          <UploadIcon />
        </span>
        <div>
          <p className="font-display text-lg text-ink">
            {uploading ? "Uploading…" : "Drag files here, or click to browse"}
          </p>
          <p className="mt-1 font-sans text-xs text-muted">PDF, Word, or text files — 10MB max each</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 font-sans text-sm text-gold-deep">
          {error}
        </p>
      )}

      {/* File list */}
      <div className="mt-8 flex items-center justify-between">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
          {files.length} Document{files.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={refreshStatuses}
          className="font-sans text-xs font-medium text-teal-deep hover:underline"
        >
          Refresh status
        </button>
      </div>

      {files.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-white p-10 text-center">
          <p className="font-sans text-sm text-muted">
            No documents yet — upload your first one above to get started.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {files.map((file) => {
            const status = STATUS_STYLES[file.status];
            return (
              <div
                key={file.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal/10 font-sans text-[10px] font-bold text-teal-deep">
                  {extensionOf(file.filename)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-medium text-ink">{file.filename}</p>
                  <p className="mt-0.5 font-sans text-xs text-muted">
                    {formatSize(file.sizeBytes)} · {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`flex items-center gap-1.5 font-sans text-xs font-medium ${status.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                  {status.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                  aria-label={`Delete ${file.filename}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-gold/15 hover:text-gold-deep disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V4M7 9l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
