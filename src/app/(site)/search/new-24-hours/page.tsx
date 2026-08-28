import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IdxEmbed } from "@/components/listings/IdxEmbed";
import { buildIdxSearchUrl } from "@/lib/listings/idxSearch";

export const metadata: Metadata = {
  title: "Newest Listings",
  description:
    "Browse the newest Key West homes for sale on the market right now, sorted newest first.",
};

export default function New24HoursPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Key West Listings" heading="New in the Last 24 Hours" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        The freshest listings on the market, sorted newest first. IDX Broker doesn&rsquo;t give us
        an exact listing timestamp, so this shows the most recently listed homes rather than a
        strict 24-hour cutoff.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <IdxEmbed src={buildIdxSearchUrl({ sort: "newest" })} title="New in the Last 24 Hours" />
      </div>

      <p className="mt-8 font-sans text-xs text-muted">
        Results sourced live from the Florida Keys MLS via IDX Broker, sorted newest first.
      </p>
    </section>
  );
}
