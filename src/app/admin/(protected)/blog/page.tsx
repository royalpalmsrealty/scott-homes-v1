import Link from "next/link";
import { getAllPosts } from "@/lib/blog/store";
import { AdminBlogList } from "@/components/admin/AdminBlogList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminBlogListPage() {
  const posts = await getAllPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const publishedCount = sorted.filter((p) => p.status === "published").length;
  const pendingCount = sorted.filter((p) => p.status === "pending_approval").length;
  const draftCount = sorted.filter((p) => p.status === "draft").length;

  return (
    <div>
      <AdminPageHeader
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5V6a2.5 2.5 0 0 1 2.5-2.5H20v15H6.5A2.5 2.5 0 0 0 4 21" />
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M8 7h8M8 10.5h8M8 14h5" />
          </svg>
        }
        eyebrow="Content Studio"
        title="Blog Posts"
        description="Write with AI assistance, review, and publish — every post here is one you actually wrote or generated, nothing pre-loaded."
        actions={
          <Link
            href="/admin/blog/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-5 font-sans text-sm font-semibold text-ink shadow-[0_8px_20px_rgba(40,188,184,0.25)] transition-transform hover:scale-[1.03]"
          >
            <PlusIcon />
            New Post
          </Link>
        }
      />

      {sorted.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-ink">
            {sorted.length} Total
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3.5 py-1.5 font-sans text-xs font-medium text-teal-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            {publishedCount} Published
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 font-sans text-xs font-medium text-gold-deep">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />
              {pendingCount} Pending
            </span>
          )}
          {draftCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-muted">
              {draftCount} Draft{draftCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      <div className="mt-8">
        <AdminBlogList posts={sorted} />
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
