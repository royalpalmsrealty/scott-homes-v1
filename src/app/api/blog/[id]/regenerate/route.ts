import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { regenerateParagraph } from "@/lib/ai/blogWriter";

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isOpenAIConfigured()) {
    return NextResponse.json({ error: "AI writer not configured yet." }, { status: 503 });
  }

  const { paragraph, instruction } = await request.json().catch(() => ({}));
  if (!paragraph || !instruction) {
    return NextResponse.json({ error: "paragraph and instruction are required." }, { status: 400 });
  }

  try {
    const rewritten = await regenerateParagraph(paragraph, instruction);
    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("Paragraph regeneration failed", error);
    return NextResponse.json({ error: "Failed to regenerate." }, { status: 502 });
  }
}
