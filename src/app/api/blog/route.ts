import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getAllPosts, createPost } from "@/lib/blog/store";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getAllPosts();
  return NextResponse.json({ posts });
}

// Manual "blank draft" creation (as opposed to /api/blog/generate's AI draft).
export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const post = await createPost({
    slug: body.slug ?? `untitled-${Date.now()}`,
    title: body.title ?? "Untitled Post",
    seoTitle: body.seoTitle ?? body.title ?? "Untitled Post",
    metaDescription: body.metaDescription ?? "",
    category: body.category ?? "Market Insights",
    tags: body.tags ?? [],
    author: "Scott Forman",
    body: body.body ?? "",
    verifyWarnings: [],
  });
  return NextResponse.json({ post });
}
