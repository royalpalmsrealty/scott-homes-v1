import { NextResponse } from "next/server";
import { weeklyAutoDraftEnabled } from "@/lib/siteConfig";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { generateBlogDraft, suggestBlogTopics, extractVerifyWarnings } from "@/lib/ai/blogWriter";
import { createPost, setPendingApproval } from "@/lib/blog/store";
import { brand } from "@/lib/brand";

// Configured in vercel.json to run weekly. Off by default (weeklyAutoDraftEnabled
// in siteConfig.ts) — turn on once Scott trusts the AI writer's output.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!weeklyAutoDraftEnabled) {
    return NextResponse.json({ skipped: true, reason: "weeklyAutoDraftEnabled is off" });
  }
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ skipped: true, reason: "Anthropic API key not configured" });
  }

  try {
    const topics = await suggestBlogTopics();
    const topic = topics[0];
    if (!topic) {
      return NextResponse.json({ skipped: true, reason: "No topic suggested" });
    }

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
      ctaText: draft.ctaText,
      verifyWarnings: extractVerifyWarnings(draft.body),
      relatedSlugs: draft.suggestedInternalLinks,
    });
    const pending = await setPendingApproval(post.id);

    // Email/SMS notification goes through GoHighLevel per D1 — not
    // configured yet, so the review link is logged instead of silently lost.
    console.log(
      `[cron] Weekly draft ready for ${brand.broker.name} to review: /admin/blog/${pending.id}`
    );

    return NextResponse.json({ created: pending.id, reviewUrl: `/admin/blog/${pending.id}` });
  } catch (error) {
    console.error("Weekly auto-draft failed", error);
    return NextResponse.json({ error: "Failed to generate weekly draft." }, { status: 500 });
  }
}
