import path from "path";
import { isOpenAIConfigured } from "./openai";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

// The chatbot's document knowledge base — one OpenAI vector store holding
// whatever PDFs/Word docs the admin panel uploads. This file is the only
// place that talks to OpenAI's Files/vector store endpoints directly.
// Metadata (filename, size, status) and the vector store ID itself live in
// Supabase (see supabase/schema.sql) — only the actual document content
// lives on OpenAI's servers.
const API_BASE = "https://api.openai.com/v1";

export type KnowledgeBaseFileStatus = "processing" | "ready" | "failed";

export type KnowledgeBaseFile = {
  id: string;
  openaiFileId: string;
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  status: KnowledgeBaseFileStatus;
};

type FileRow = {
  id: string;
  openai_file_id: string;
  filename: string;
  size_bytes: number;
  status: KnowledgeBaseFileStatus;
  uploaded_at: string;
};

// Kept to what a real estate office would actually have on hand — not the
// full 25+ formats OpenAI accepts.
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md"];

export function isFileTypeAllowed(filename: string) {
  return ALLOWED_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

function authHeaders() {
  return { authorization: `Bearer ${process.env.OPENAI_API_KEY}` };
}

function fromRow(row: FileRow): KnowledgeBaseFile {
  return {
    id: row.id,
    openaiFileId: row.openai_file_id,
    filename: row.filename,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at,
    status: row.status,
  };
}

export async function getVectorStoreId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await getSupabase().from("app_config").select("value").eq("key", "vector_store_id").maybeSingle();
  return data?.value ?? null;
}

async function setVectorStoreId(id: string) {
  await getSupabase()
    .from("app_config")
    .upsert({ key: "vector_store_id", value: id, updated_at: new Date().toISOString() });
}

async function ensureVectorStore(): Promise<string> {
  const existing = await getVectorStoreId();
  if (existing) return existing;

  const res = await fetch(`${API_BASE}/vector_stores`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name: "Royal Palms Realty Knowledge Base" }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create vector store (${res.status}): ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  await setVectorStoreId(data.id);
  return data.id;
}

// Refreshes "processing" statuses against OpenAI (indexing a freshly
// uploaded file takes a few seconds) so the admin page never shows a status
// that's gone stale.
export async function listKnowledgeBaseFiles(): Promise<KnowledgeBaseFile[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabase()
    .from("knowledge_base_files")
    .select("*")
    .order("uploaded_at", { ascending: false });
  if (error || !data) return [];

  const files = (data as FileRow[]).map(fromRow);
  if (!isOpenAIConfigured()) return files;

  const vectorStoreId = await getVectorStoreId();
  if (!vectorStoreId) return files;

  for (const file of files) {
    if (file.status !== "processing") continue;
    try {
      const res = await fetch(`${API_BASE}/vector_stores/${vectorStoreId}/files/${file.openaiFileId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) continue;
      const statusData = await res.json();
      const nextStatus: KnowledgeBaseFileStatus =
        statusData.status === "completed" ? "ready" : statusData.status === "failed" ? "failed" : "processing";
      if (nextStatus !== file.status) {
        await getSupabase().from("knowledge_base_files").update({ status: nextStatus }).eq("id", file.id);
        file.status = nextStatus;
      }
    } catch {
      // Leave it as "processing" — we'll check again next time the page loads.
    }
  }
  return files;
}

export async function uploadKnowledgeBaseFile(file: File): Promise<KnowledgeBaseFile> {
  if (!isOpenAIConfigured()) throw new Error("OPENAI_API_KEY not configured");
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

  const vectorStoreId = await ensureVectorStore();

  const uploadForm = new FormData();
  uploadForm.append("file", file, file.name);
  uploadForm.append("purpose", "assistants");

  const uploadRes = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: authHeaders(),
    body: uploadForm,
  });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed (${uploadRes.status}): ${await uploadRes.text().catch(() => "")}`);
  }
  const uploaded = await uploadRes.json();

  const attachRes = await fetch(`${API_BASE}/vector_stores/${vectorStoreId}/files`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ file_id: uploaded.id }),
  });
  if (!attachRes.ok) {
    throw new Error(`Adding to knowledge base failed (${attachRes.status}): ${await attachRes.text().catch(() => "")}`);
  }

  const { data, error } = await getSupabase()
    .from("knowledge_base_files")
    .insert({
      openai_file_id: uploaded.id,
      filename: file.name,
      size_bytes: file.size,
      status: "processing",
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to record uploaded file: ${error.message}`);
  return fromRow(data as FileRow);
}

export async function deleteKnowledgeBaseFile(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data } = await getSupabase().from("knowledge_base_files").select("*").eq("id", id).maybeSingle();
  if (!data) return;
  const record = fromRow(data as FileRow);

  const vectorStoreId = await getVectorStoreId();
  if (vectorStoreId) {
    await fetch(`${API_BASE}/vector_stores/${vectorStoreId}/files/${record.openaiFileId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).catch(() => {});
  }
  await fetch(`${API_BASE}/files/${record.openaiFileId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).catch(() => {});

  await getSupabase().from("knowledge_base_files").delete().eq("id", id);
}
