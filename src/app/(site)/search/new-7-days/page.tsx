import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IdxEmbed } from "@/components/listings/IdxEmbed";
import { buildIdxSearchUrl } from "@/lib/listings/idxSearch";

export const metadata: Metadata = {
  title: "Newest Listings This Week",
  description:
    "Browse a broader set of the newest Key West homes for sale on the market, sorted newest first.",
};

export default function New7DaysPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Key West Listings" heading="New in the Last 7 Days" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        A broader look at what&rsquo;s newest on the market, sorted newest first — same live feed
        as the 24-hour view, just more of it. IDX Broker doesn&rsquo;t give us an exact listing
        timestamp, so this can&rsquo;t be sliced to a strict 7-day cutoff.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <IdxEmbed src={buildIdxSearchUrl({ sort: "newest" })} title="New in the Last 7 Days" />
      </div>

      <p className="mt-8 font-sans text-xs text-muted">
        Results sourced live from the Florida Keys MLS via IDX Broker, sorted newest first.
      </p>
    </section>
  );
}
