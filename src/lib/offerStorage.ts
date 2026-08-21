import { getSupabase } from "@/lib/supabase";
import type { UploadDocumentKind } from "@/lib/schemas/offer";

// Buyer-uploaded offer documents (photo ID, proof of funds, preapproval,
// contingency docs) — sensitive, so unlike blogImage.ts's public bucket this
// one is never public. The only way to read a file back is a short-lived
// signed URL generated on demand for an authorized viewer (Scott, via a link
// sent through GHL) — no public URL for these files ever exists.
const BUCKET = "offer-documents";
const MAX_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

let bucketEnsured = false;

async function ensureBucket() {
  if (bucketEnsured) return;
  const supabase = getSupabase();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }
  bucketEnsured = true;
}

export function isAllowedDocumentFile(file: File): boolean {
  return ALLOWED_TYPES.has(file.type) && file.size > 0 && file.size <= MAX_SIZE_BYTES;
}

export async function uploadOfferDocument(
  offerId: string,
  kind: UploadDocumentKind,
  file: File
): Promise<{ path: string }> {
  await ensureBucket();
  const supabase = getSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${offerId}/${kind}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: file.type });
  if (error) throw new Error(`Failed to upload offer document: ${error.message}`);

  return { path };
}

// 10-minute signed link — generated fresh each time it's needed, never
// stored, so a leaked link goes stale quickly.
export async function getSignedDocumentUrl(path: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}
