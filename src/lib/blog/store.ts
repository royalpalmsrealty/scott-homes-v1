import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { BlogPost, BlogPostStatus } from "./types";

// Supabase-backed store — see supabase/schema.sql for the table. Column
// names are snake_case in the DB; fromRow/toRow are the only place that
// translates between that and the camelCase BlogPost type used everywhere else.
type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  category: string;
  tags: string[];
  author: string;
  body: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  status: BlogPostStatus;
  created_at: string;
  published_at: string | null;
  cta_text: string | null;
  cta_href: string | null;
  verify_warnings: string[];
  related_slugs: string[] | null;
};

function fromRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    category: row.category,
    tags: row.tags,
    author: row.author,
    body: row.body,
    coverImage: row.cover_image ?? undefined,
    coverImageAlt: row.cover_image_alt ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at ?? undefined,
    ctaText: row.cta_text ?? undefined,
    ctaHref: row.cta_href ?? undefined,
    verifyWarnings: row.verify_warnings ?? [],
    relatedSlugs: row.related_slugs ?? undefined,
  };
}

function toRow(post: Partial<BlogPost>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (post.slug !== undefined) row.slug = post.slug;
  if (post.title !== undefined) row.title = post.title;
  if (post.seoTitle !== undefined) row.seo_title = post.seoTitle;
  if (post.metaDescription !== undefined) row.meta_description = post.metaDescription;
  if (post.category !== undefined) row.category = post.category;
  if (post.tags !== undefined) row.tags = post.tags;
  if (post.author !== undefined) row.author = post.author;
  if (post.body !== undefined) row.body = post.body;
  if (post.coverImage !== undefined) row.cover_image = post.coverImage ?? null;
  if (post.coverImageAlt !== undefined) row.cover_image_alt = post.coverImageAlt ?? null;
  if (post.ctaText !== undefined) row.cta_text = post.ctaText ?? null;
  if (post.ctaHref !== undefined) row.cta_href = post.ctaHref ?? null;
  if (post.verifyWarnings !== undefined) row.verify_warnings = post.verifyWarnings;
  if (post.relatedSlugs !== undefined) row.related_slugs = post.relatedSlugs ?? null;
  return row;
}

// Reads are dummy-safe (return empty/undefined rather than throw) because
// blog pages are statically generated — build time has no Supabase
// credentials available until they're actually set, and a throw here would
// fail the entire site's build, not just the blog. Writes (below) are only
// ever called from admin API routes at runtime, so they throw normally;
// those routes already catch and return a proper error response.
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabase().from("blog_posts").select("*");
  if (error) return [];
  return (data as BlogPostRow[]).map(fromRow);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabase()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) return [];
  return (data as BlogPostRow[]).map(fromRow);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  const { data, error } = await getSupabase().from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return undefined;
  return fromRow(data as BlogPostRow);
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  const { data, error } = await getSupabase().from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return fromRow(data as BlogPostRow);
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt" | "status" | "publishedAt"> & { status?: "draft" | "pending_approval" }
): Promise<BlogPost> {
  const row = { ...toRow(input), status: input.status ?? "draft" };
  const { data, error } = await getSupabase().from("blog_posts").insert(row).select().single();
  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return fromRow(data as BlogPostRow);
}

// Explicitly cannot set status to "published" — see publishPost() below,
// the one function allowed to make that transition. This is the hard
// requirement: no code path publishes except an explicit human action.
export async function updatePost(
  id: string,
  patch: Partial<Omit<BlogPost, "id" | "status" | "publishedAt">>
): Promise<BlogPost> {
  const { data, error } = await getSupabase().from("blog_posts").update(toRow(patch)).eq("id", id).select().single();
  if (error) throw new Error(`Post ${id} not found`);
  return fromRow(data as BlogPostRow);
}

export async function setPendingApproval(id: string): Promise<BlogPost> {
  const existing = await getPostById(id);
  if (!existing) throw new Error(`Post ${id} not found`);
  if (existing.status === "published") {
    throw new Error("Cannot move a published post back to pending_approval here");
  }
  const { data, error } = await getSupabase()
    .from("blog_posts")
    .update({ status: "pending_approval" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Post ${id} not found`);
  return fromRow(data as BlogPostRow);
}

// The single publish path. Called only from the admin "Publish" button's
// API route — never from draft generation or auto-save.
export async function publishPost(id: string): Promise<BlogPost> {
  const existing = await getPostById(id);
  if (!existing) throw new Error(`Post ${id} not found`);
  if (existing.status !== "pending_approval") {
    throw new Error("Only posts in pending_approval can be published");
  }
  const { data, error } = await getSupabase()
    .from("blog_posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Post ${id} not found`);
  return fromRow(data as BlogPostRow);
}

export async function deletePost(id: string): Promise<void> {
  await getSupabase().from("blog_posts").delete().eq("id", id);
}
