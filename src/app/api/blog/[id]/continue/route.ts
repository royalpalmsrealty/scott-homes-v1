import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { continueWriting } from "@/lib/ai/blogWriter";

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ error: "AI writer not configured yet." }, { status: 503 });
  }

  const { currentBody } = await request.json().catch(() => ({}));
  if (!currentBody) {
    return NextResponse.json({ error: "currentBody is required." }, { status: 400 });
  }

  try {
    const continuation = await continueWriting(currentBody);
    return NextResponse.json({ continuation });
  } catch (error) {
    console.error("Continue-writing failed", error);
    return NextResponse.json({ error: "Failed to continue." }, { status: 502 });
  }
}
