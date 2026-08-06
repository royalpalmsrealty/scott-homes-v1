import type { MetadataRoute } from "next";
import { neighborhoods } from "@/lib/neighborhoods";
import { getPublishedPosts } from "@/lib/blog/store";

// TODO-CLIENT-ASSET: replace with the real production domain before launch.
const BASE_URL = "https://www.royalpalmsrealty.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/neighborhoods",
    "/blog",
    "/search/new-24-hours",
    "/search/new-7-days",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const neighborhoodRoutes = neighborhoods.map((n) => ({
    url: `${BASE_URL}/neighborhoods/${n.slug}`,
    lastModified: new Date(),
  }));

  const posts = await getPublishedPosts();
  const blogRoutes = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }));

  return [...staticRoutes, ...neighborhoodRoutes, ...blogRoutes];
}
