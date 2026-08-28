import { redirect, notFound } from "next/navigation";
import { parseOwnListingSlug, buildIdxDetailUrl } from "@/lib/listings/idxScrape";

// Migration note (2026-08-26): this used to render a fully custom listing
// detail page, fetched via fetchListingDetail (scraping IDX Broker's public
// Details page). Per the decision to hand off listing details to IDX
// Broker's own (CSS-skinned) Details template — see the "Stop scraping IDX
// Broker" plan — that's now the page visitors actually land on when browsing
// embedded results. This route stays only as a redirect, so any
// already-shared or already-indexed /listings/[id]-[slug] link still lands
// somewhere real instead of 404ing. Pure URL construction, no fetch.
export default async function ListingDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseOwnListingSlug(slug);
  if (!parsed) notFound();

  redirect(buildIdxDetailUrl(parsed.listingId, parsed.addressSlug));
}
