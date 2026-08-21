import { NextResponse } from "next/server";
import { UploadDocumentKindSchema } from "@/lib/schemas/offer";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAllowedDocumentFile, uploadOfferDocument } from "@/lib/offerStorage";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`offer-docs:${ip}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Document upload isn't available right now." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  // Honeypot — real buyers never see or fill this field. Report success to
  // whatever filled it in, drop the payload, same as the contact form.
  const company = form.get("company");
  if (typeof company === "string" && company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const kindParsed = UploadDocumentKindSchema.safeParse(form.get("kind"));
  const file = form.get("file");
  if (!kindParsed.success || !(file instanceof File)) {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!isAllowedDocumentFile(file)) {
    return NextResponse.json({ error: "That file type or size isn't allowed (JPG/PNG/WEBP/PDF, up to 15MB)." }, { status: 400 });
  }

  // Only ever attach a document to an offer that's still in progress —
  // guards against uploading against a stale/finalized/unrelated offer id.
  const { data: offer } = await getSupabase().from("offers").select("id, status").eq("id", id).maybeSingle();
  if (!offer || offer.status !== "draft") {
    return NextResponse.json({ error: "That offer can't accept documents right now." }, { status: 404 });
  }

  const { path } = await uploadOfferDocument(id, kindParsed.data, file).catch((error) => {
    console.error("Offer document upload failed", error);
    return { path: null };
  });
  if (!path) {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { error } = await getSupabase().from("offer_documents").insert({
    offer_id: id,
    kind: kindParsed.data,
    storage_path: path,
    filename: file.name,
    size_bytes: file.size,
  });
  if (error) {
    console.error("Failed to record offer document", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
