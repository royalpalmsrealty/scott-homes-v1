import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPublishedPosts } from "@/lib/blog/store";
import { BLOG_CATEGORIES } from "@/lib/blog/types";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Key West real estate insights, neighborhood guides, and buying/selling advice from Royal Palms Realty.",
};

const PAGE_SIZE = 9;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page } = await searchParams;
  const posts = await getPublishedPosts();

  let filtered = posts;
  if (category) filtered = filtered.filter((p) => p.category === category);
  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(needle) || p.body.toLowerCase().includes(needle)
    );
  }

  const [featured, ...rest] = filtered;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const start = (pageNum - 1) * PAGE_SIZE;
  const pageItems = rest.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="From Royal Palms Realty" heading="Blog" as="h1" />

      <form className="mt-8 flex flex-wrap items-center gap-3" action="/blog">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search articles…"
          className="min-w-0 flex-1 border border-line px-4 py-2.5 font-sans text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none sm:max-w-xs"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`border px-3 py-1.5 font-sans text-sm transition-colors ${
            !category ? "border-ink bg-ink text-white" : "border-line text-body hover:border-ink"
          }`}
        >
          All
        </Link>
        {BLOG_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}`}
            className={`border px-3 py-1.5 font-sans text-sm transition-colors ${
              category === c ? "border-ink bg-ink text-white" : "border-line text-body hover:border-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 font-sans text-base text-body">
          Nothing matches yet — try a different search or category.
        </p>
      ) : (
        <>
          {pageNum === 1 && featured && (
            <div className="mt-10">
              <BlogCard post={featured} featured />
            </div>
          )}

          {pageItems.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/blog?${new URLSearchParams({
                    ...(category ? { category } : {}),
                    ...(q ? { q } : {}),
                    page: String(i + 1),
                  }).toString()}`}
                  className={`flex h-9 w-9 items-center justify-center border font-sans text-sm ${
                    pageNum === i + 1 ? "border-ink bg-ink text-white" : "border-line text-body"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
