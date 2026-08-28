import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IdxEmbed } from "@/components/listings/IdxEmbed";
import { SOLD_PENDING_URL } from "@/lib/listings/idxScrape";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Recently Sold",
  description: `A look at ${brand.broker.name}'s recently sold Key West listings.`,
};

export default function SoldPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Track Record" heading="Recently Sold" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        A look at homes {brand.broker.name} has personally sold — pulled live from the Florida
        Keys MLS, not a curated highlight reel.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <IdxEmbed src={SOLD_PENDING_URL} title="Recently Sold" />
      </div>

      <p className="mt-8 font-sans text-xs text-muted">
        Sold data sourced live from the Florida Keys MLS via IDX Broker.
      </p>
    </section>
  );
}
