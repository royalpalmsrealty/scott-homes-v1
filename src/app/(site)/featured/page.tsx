import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IdxEmbed } from "@/components/listings/IdxEmbed";
import { FEATURED_URL } from "@/lib/listings/idxScrape";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Featured Listings",
  description: `${brand.broker.name}'s featured Key West listings.`,
};

export default function FeaturedPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Featured" heading="Featured Listings" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        {brand.broker.name}&rsquo;s featured active listings — pulled live from the Florida Keys
        MLS.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <IdxEmbed src={FEATURED_URL} title="Featured Listings" />
      </div>

      <p className="mt-8 font-sans text-xs text-muted">
        Results sourced live from the Florida Keys MLS via IDX Broker.
      </p>
    </section>
  );
}
