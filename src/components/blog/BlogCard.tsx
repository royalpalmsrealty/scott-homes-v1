import Link from "next/link";
import type { BlogPost } from "@/lib/blog/types";
import { estimateReadingTime } from "@/lib/blog/readingTime";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border border-line bg-white transition-colors hover:border-teal-deep"
    >
      <div className="aspect-[3/2] overflow-hidden bg-paper">
        <div className="flex h-full items-center justify-center font-sans text-xs uppercase tracking-wide text-muted">
          {/* TODO-CLIENT-ASSET: cover photo pending — see imageKeywords on the draft */}
          Photography Pending
        </div>
      </div>
      <div className="p-5">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-gold-deep">
          {post.category}
        </p>
        <p className="mt-2 font-display text-xl text-ink transition-colors group-hover:text-teal-deep">
          {post.title}
        </p>
        <p className="mt-2 font-sans text-sm text-body">{post.metaDescription}</p>
        <p className="mt-3 font-sans text-xs text-muted">
          {estimateReadingTime(post.body)} min read
        </p>
      </div>
    </Link>
  );
}
