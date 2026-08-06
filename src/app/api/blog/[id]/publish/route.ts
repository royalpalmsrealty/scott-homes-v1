import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getPostById, publishPost } from "@/lib/blog/store";
import { pingIndexNow } from "@/lib/indexNow";

// The one route in the entire codebase that can move a post to "published".
// Nothing else calls publishPost() — draft generation, saving, and
// submit-for-approval all stop short of this deliberately.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { force } = await request.json().catch(() => ({ force: false }));

  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.verifyWarnings.length > 0 && !force) {
    return NextResponse.json(
      {
        error: "unresolved_verify_warnings",
        warnings: existing.verifyWarnings,
        message: "This post still has unresolved [VERIFY: ...] placeholders. Publish anyway?",
      },
      { status: 409 }
    );
  }

  try {
    const post = await publishPost(id);
    await pingIndexNow(`https://www.royalpalmsrealty.com/blog/${post.slug}`);

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
