import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { generateBlogDraft, extractVerifyWarnings } from "@/lib/ai/blogWriter";
import { createPost } from "@/lib/blog/store";

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "OpenAI API key not configured yet — the AI writer will work once it's set." },
      { status: 503 }
    );
  }

  const { topic } = await request.json().catch(() => ({ topic: "" }));
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "A topic is required." }, { status: 400 });
  }

  try {
    const draft = await generateBlogDraft(topic);
    const post = await createPost({
      slug: draft.slug,
      title: draft.title,
      seoTitle: draft.seoTitle,
      metaDescription: draft.metaDescription,
      category: draft.category,
      tags: draft.tags,
      author: "Scott Forman",
      body: draft.body,
      coverImage: draft.coverImage,
      coverImageAlt: draft.coverImageAlt,
      ctaText: draft.ctaText,
      verifyWarnings: extractVerifyWarnings(draft.body),
      relatedSlugs: draft.suggestedInternalLinks,
      status: "draft",
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Draft generation failed", error);
    return NextResponse.json({ error: "Failed to generate a draft. Try again." }, { status: 502 });
  }
}
