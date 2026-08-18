import { callOpenAI } from "./openai";
import { extractJson } from "./anthropic";
import { generateAndStoreCoverImage } from "./blogImage";
import { BlogDraftSchema, type BlogDraft } from "@/lib/schemas/blogDraft";
import { blogHouseStylePrompt } from "@/lib/siteConfig";
import { neighborhoods } from "@/lib/neighborhoods";
import { BLOG_CATEGORIES } from "@/lib/blog/types";

const neighborhoodNames = neighborhoods.map((n) => n.name).join(", ");

function draftSystemPrompt() {
  return `${blogHouseStylePrompt}

You are drafting a blog post for a Key West real estate website. Valid categories: ${BLOG_CATEGORIES.join(", ")}. Valid neighborhoods to link to internally: ${neighborhoodNames}.

Body formatting: plain paragraphs separated by blank lines. Use "## Heading" on its own line for section headings. Use "- item" lines for bullet lists. No other markdown.

Return ONLY a JSON object, no prose, no markdown fences, with exactly these keys:
{
  "title": string,
  "seoTitle": string (under 70 characters),
  "metaDescription": string (under 160 characters),
  "slug": string (lowercase, hyphenated, no special characters),
  "category": one of the valid categories above,
  "tags": string[] (3-6 short tags),
  "body": string (the full article, per the formatting rules above, per the house style),
  "ctaText": string (one sentence, matches the house style's closing CTA),
  "suggestedInternalLinks": string[] (neighborhood names from the valid list this post should link to, if any),
  "imageKeywords": string[] (2-4 keywords describing what the cover photo should show)
}`;
}

export type BlogDraftWithImage = BlogDraft & { coverImage?: string; coverImageAlt?: string };

export async function generateBlogDraft(topic: string): Promise<BlogDraftWithImage> {
  const text = await callOpenAI({
    system: draftSystemPrompt(),
    prompt: `Topic: ${topic}`,
    maxOutputTokens: 3000,
  });
  const draft = BlogDraftSchema.parse(extractJson(text));

  // Best-effort — a failed image generation never blocks the draft itself.
  const image = await generateAndStoreCoverImage({
    slug: draft.slug,
    title: draft.title,
    category: draft.category,
    imageKeywords: draft.imageKeywords,
  });

  return { ...draft, coverImage: image?.url, coverImageAlt: image?.alt };
}

export async function suggestBlogTopics(): Promise<string[]> {
  const text = await callOpenAI({
    system: `You suggest blog topic ideas for a Key West, Florida real estate brokerage's website. Angles to draw from: local market activity, neighborhood guides, lifestyle/relocation, buyer and seller education, and search terms locals and prospective buyers actually use. Return ONLY a JSON array of exactly 10 short topic strings, no prose, no markdown fences.`,
    prompt: "Suggest 10 topics.",
    maxOutputTokens: 500,
  });
  const parsed = extractJson(text);
  return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
}

export async function regenerateParagraph(paragraph: string, instruction: string): Promise<string> {
  return callOpenAI({
    system: `${blogHouseStylePrompt}\n\nYou are revising one paragraph of an existing blog post. Return ONLY the rewritten paragraph — no preamble, no explanation, no quotes around it.`,
    prompt: `Instruction: ${instruction}\n\nParagraph:\n${paragraph}`,
    maxOutputTokens: 600,
  });
}

export async function continueWriting(currentBody: string): Promise<string> {
  return callOpenAI({
    system: `${blogHouseStylePrompt}\n\nContinue the blog post below with 2-3 more paragraphs in the same voice and formatting convention (blank-line-separated paragraphs, "## Heading" for sections). Return ONLY the new paragraphs to append — not the original text.`,
    prompt: currentBody,
    maxOutputTokens: 1000,
  });
}

// Scans a draft's body for [VERIFY: ...] markers so the publish flow can
// surface them as a warning rather than let them slip through silently.
export function extractVerifyWarnings(body: string): string[] {
  const matches = body.match(/\[VERIFY:[^\]]*\]/g);
  return matches ?? [];
}
