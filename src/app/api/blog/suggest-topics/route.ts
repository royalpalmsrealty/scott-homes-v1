import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { suggestBlogTopics } from "@/lib/ai/blogWriter";

export async function POST() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAnthropicConfigured()) {
    return NextResponse.json({
      topics: [],
      disabled: true,
      message: "Anthropic API key not configured yet — topic suggestions will work once it's set.",
    });
  }

  try {
    const topics = await suggestBlogTopics();
    return NextResponse.json({ topics, disabled: false });
  } catch (error) {
    console.error("Topic suggestion failed", error);
    return NextResponse.json({ error: "Failed to generate topics." }, { status: 502 });
  }
}
