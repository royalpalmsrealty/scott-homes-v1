import { z } from "zod";

export const BlogDraftSchema = z.object({
  title: z.string().min(5).max(120),
  seoTitle: z.string().min(5).max(70),
  metaDescription: z.string().min(20).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string(),
  tags: z.array(z.string()).max(6),
  body: z.string().min(200),
  ctaText: z.string(),
  suggestedInternalLinks: z.array(z.string()).default([]),
  imageKeywords: z.array(z.string()).default([]),
});

export type BlogDraft = z.infer<typeof BlogDraftSchema>;
