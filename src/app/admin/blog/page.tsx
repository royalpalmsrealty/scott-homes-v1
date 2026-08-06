import Link from "next/link";
import { getAllPosts } from "@/lib/blog/store";

const statusStyles: Record<string, string> = {
  draft: "bg-line text-muted",
  pending_approval: "bg-gold/20 text-gold-deep",
  published: "bg-teal/20 text-teal-deep",
};

export default async function AdminBlogListPage() {
  const posts = await getAllPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="inline-flex min-h-11 items-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
        >
          New Post
        </Link>
      </div>

      <div className="mt-8 border border-line bg-white">
        {sorted.length === 0 && (
          <p className="p-8 text-center font-sans text-sm text-muted">No posts yet.</p>
        )}
        {sorted.map((post) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 transition-colors last:border-b-0 hover:bg-paper"
          >
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-medium text-ink">{post.title}</p>
              <p className="mt-0.5 font-sans text-xs text-muted">
                {post.category} · {new Date(post.createdAt).toLocaleDateString()}
                {post.verifyWarnings.length > 0 && (
                  <span className="ml-2 text-gold-deep">
                    {post.verifyWarnings.length} unresolved item{post.verifyWarnings.length > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 font-sans text-[11px] font-medium uppercase tracking-wide ${statusStyles[post.status]}`}
            >
              {post.status.replace("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
