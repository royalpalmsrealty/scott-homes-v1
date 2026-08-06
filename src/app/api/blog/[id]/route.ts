import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getPostById, updatePost } from "@/lib/blog/store";
import { extractVerifyWarnings } from "@/lib/ai/blogWriter";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const patch = await request.json().catch(() => ({}));

  // Re-scan for [VERIFY: ...] markers whenever the body changes — editing
  // by hand can introduce or remove them just as generation can.
  if (typeof patch.body === "string") {
    patch.verifyWarnings = extractVerifyWarnings(patch.body);
  }

  try {
    const post = await updatePost(id, patch);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
