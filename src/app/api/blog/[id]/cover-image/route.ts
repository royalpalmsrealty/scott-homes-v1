import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getPostById, updatePost } from "@/lib/blog/store";
import { uploadCoverImageFile, deleteCoverImageIfOwned } from "@/lib/ai/blogImage";
import { isSupabaseConfigured } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase isn't configured yet." }, { status: 503 });
  }

  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Image is too large (8MB max)." }, { status: 400 });
  }

  try {
    const url = await uploadCoverImageFile(file, existing.slug);
    // Best-effort — a failed cleanup of the old image should never block
    // the swap itself from completing.
    await deleteCoverImageIfOwned(existing.coverImage);

    const post = await updatePost(id, { coverImage: url, coverImageAlt: existing.title });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
