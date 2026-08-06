export type BlogPostStatus = "draft" | "pending_approval" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  author: string;
  body: string; // paragraphs separated by blank lines — see renderBody()
  coverImage?: string;
  coverImageAlt?: string;
  status: BlogPostStatus;
  createdAt: string;
  publishedAt?: string;
  ctaText?: string;
  ctaHref?: string;
  /** [VERIFY: ...] placeholders the writer inserted instead of guessing a fact. */
  verifyWarnings: string[];
  relatedSlugs?: string[];
};

export const BLOG_CATEGORIES = [
  "Market Insights",
  "Neighborhood Guides",
  "Buying",
  "Selling",
  "Lifestyle",
] as const;
