import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { deleteKnowledgeBaseFile } from "@/lib/ai/knowledgeBase";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteKnowledgeBaseFile(id);
  return NextResponse.json({ ok: true });
}
