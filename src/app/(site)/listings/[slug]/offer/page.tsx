import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { parseOwnListingSlug, fetchListingDetail } from "@/lib/listings/idxScrape";
import { OfferFlow } from "@/components/offer/OfferFlow";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const dynamic = "force-dynamic"; // always a live MLS lookup, never cached

export const metadata: Metadata = {
  title: "Make an Offer",
  robots: { index: false }, // buyer-specific flow, not a canonical indexable page
};

export default async function MakeOfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseOwnListingSlug(slug);
  if (!parsed) notFound();

  const listing = await fetchListingDetail(parsed.listingId, parsed.addressSlug);
  if (!listing) notFound();

  return (
    <section className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <SectionHeading
        eyebrow={`${listing.address}, ${listing.city}`}
        heading="Make an Offer"
        as="h1"
      />
      <div className="mt-8">
        <OfferFlow listing={listing} addressSlug={parsed.addressSlug} />
      </div>
    </section>
  );
}
