import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { setPendingApproval } from "@/lib/blog/store";

// Moves draft -> pending_approval. Still not published — see publish/route.ts.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const post = await setPendingApproval(id);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
