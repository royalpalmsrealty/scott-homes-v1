import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/blog/BlogBody";
import { BlogCard } from "@/components/blog/BlogCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog/store";
import { estimateReadingTime, extractH2Headings, wordCount } from "@/lib/blog/readingTime";
import { brand } from "@/lib/brand";

export const revalidate = 900;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") return {};

  return {
    title: post.seoTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.seoTitle,
      description: post.metaDescription,
      images: [`/blog/${post.slug}/opengraph-image`],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const readingTime = estimateReadingTime(post.body);
  const words = wordCount(post.body);
  const headings = extractH2Headings(post.body);
  const showToc = words > 1200 && headings.length > 1;

  const allPublished = await getPublishedPosts();
  const related = allPublished.filter((p) => post.relatedSlugs?.includes(p.slug)).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.metaDescription,
              author: { "@type": "Person", name: post.author },
              publisher: { "@type": "Organization", name: brand.brokerage },
              datePublished: post.publishedAt,
              dateModified: post.publishedAt,
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Blog", item: "/blog" },
                { "@type": "ListItem", position: 2, name: post.title, item: `/blog/${post.slug}` },
              ],
            },
          ]),
        }}
      />

      <article className="mx-auto max-w-[760px] px-4 py-14 sm:px-6 sm:py-24">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold">
          {post.category}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        <span className="mt-4 block h-px w-16 bg-gold" aria-hidden="true" />

        <div className="mt-6 flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-paper font-display text-sm text-teal-deep"
            aria-hidden="true"
          >
            SF
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-ink">{post.author}</p>
            <p className="font-sans text-xs text-muted">
              {post.publishedAt && new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              {" · "}
              {readingTime} min read
            </p>
          </div>
        </div>

        {showToc && (
          <nav aria-label="Table of contents" className="mt-8 border border-line bg-paper p-5">
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-gold-deep">
              In This Article
            </p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {headings.map((h) => (
                <li key={h}>
                  <a
                    href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                    className="font-sans text-sm text-teal-deep hover:underline"
                  >
                    {h}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-8">
          <BlogBody body={post.body} />
        </div>

        {post.ctaText && (
          <div className="mt-10 border border-teal/30 bg-teal/10 p-6 text-center">
            <p className="font-sans text-base font-medium text-ink">{post.ctaText}</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
            >
              Get in Touch
            </Link>
          </div>
        )}

        <ShareButtons title={post.title} />

        {related.length > 0 && (
          <div className="mt-14 border-t border-line pt-10">
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-gold-deep">
              Related Reading
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
