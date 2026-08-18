import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog/types";
import { estimateReadingTime } from "@/lib/blog/readingTime";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg ${
        featured ? "sm:flex sm:items-stretch" : ""
      }`}
    >
      <div className={`relative aspect-[3/2] overflow-hidden bg-paper ${featured ? "sm:aspect-auto sm:w-1/2 sm:shrink-0" : ""}`}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt ?? post.title}
            fill
            sizes={featured ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,var(--teal-deep)_0%,var(--ink)_100%)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60">
              <CameraIcon />
            </span>
            <span className="font-sans text-[11px] font-medium uppercase tracking-wide text-white/50">
              Photography Pending
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-gold-deep shadow-sm backdrop-blur">
          {post.category}
        </span>
      </div>

      <div className={`p-6 ${featured ? "flex flex-col justify-center sm:w-1/2 sm:p-8" : ""}`}>
        <p
          className={`font-display text-ink transition-colors group-hover:text-teal-deep ${
            featured ? "text-2xl sm:text-[28px]" : "text-xl"
          }`}
        >
          {post.title}
        </p>
        <p className={`mt-2 font-sans text-sm text-body ${featured ? "" : "line-clamp-2"}`}>
          {post.metaDescription}
        </p>
        <div className="mt-4 flex items-center gap-1.5 font-sans text-xs text-muted">
          <ClockIcon />
          {estimateReadingTime(post.body)} min read
        </div>
      </div>
    </Link>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
