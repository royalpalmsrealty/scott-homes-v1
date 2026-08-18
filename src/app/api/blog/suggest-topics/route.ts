import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { suggestBlogTopics } from "@/lib/ai/blogWriter";

export async function POST() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json({
      topics: [],
      disabled: true,
      message: "OpenAI API key not configured yet — topic suggestions will work once it's set.",
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
