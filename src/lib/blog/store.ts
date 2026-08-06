import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { BlogPost, BlogPostStatus } from "./types";
import { seedPosts } from "./seed";

// JSON-file-backed store — the "lightweight config now" approach (see D2).
// Swap this file's internals for real database calls once a CMS/DB is
// chosen; nothing outside this file should touch the JSON directly.
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "blog-posts.json");

async function readAll(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seedPosts, null, 2), "utf8");
    return seedPosts;
  }
}

async function writeAll(posts: BlogPost[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), "utf8");
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return readAll();
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await readAll();
  return posts
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await readAll();
  return posts.find((p) => p.slug === slug);
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  const posts = await readAll();
  return posts.find((p) => p.id === id);
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt" | "status" | "publishedAt"> & { status?: "draft" | "pending_approval" }
): Promise<BlogPost> {
  const posts = await readAll();
  const post: BlogPost = {
    ...input,
    id: crypto.randomUUID(),
    status: input.status ?? "draft",
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  await writeAll(posts);
  return post;
}

// Explicitly cannot set status to "published" — see publishPost() below,
// the one function allowed to make that transition. This is the hard
// requirement: no code path publishes except an explicit human action.
export async function updatePost(
  id: string,
  patch: Partial<Omit<BlogPost, "id" | "status" | "publishedAt">>
): Promise<BlogPost> {
  const posts = await readAll();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Post ${id} not found`);

  posts[index] = { ...posts[index], ...patch };
  await writeAll(posts);
  return posts[index];
}

export async function setPendingApproval(id: string): Promise<BlogPost> {
  const posts = await readAll();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Post ${id} not found`);
  if (posts[index].status === "published") {
    throw new Error("Cannot move a published post back to pending_approval here");
  }

  posts[index] = { ...posts[index], status: "pending_approval" as BlogPostStatus };
  await writeAll(posts);
  return posts[index];
}

// The single publish path. Called only from the admin "Publish" button's
// API route — never from draft generation or auto-save.
export async function publishPost(id: string): Promise<BlogPost> {
  const posts = await readAll();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Post ${id} not found`);
  if (posts[index].status !== "pending_approval") {
    throw new Error("Only posts in pending_approval can be published");
  }

  posts[index] = {
    ...posts[index],
    status: "published" as BlogPostStatus,
    publishedAt: new Date().toISOString(),
  };
  await writeAll(posts);
  return posts[index];
}

export async function deletePost(id: string): Promise<void> {
  const posts = await readAll();
  await writeAll(posts.filter((p) => p.id !== id));
}
