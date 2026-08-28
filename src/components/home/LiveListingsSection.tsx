import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Migration note (2026-08-26): this used to call fetchIdxListings directly on
// every homepage load — the highest-traffic page on the site, and exactly the
// wrong place to keep scraping IDX Broker's pages after their support team
// confirmed that's not a supported integration method. The old WordPress site
// solved this with an official IDX Broker homepage widget (a <script> embed
// that fetches from the visitor's own browser, not our server) — this section
// should be swapped for that same widget once Scott sets one up in
// Design → Website → Widgets and shares the embed snippet. Until then, this
// is a static promotional link with no live data at all, rather than
// fabricating or continuing to scrape one.
export function LiveListingsSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-6 border border-line bg-paper p-8 sm:p-12">
        <div>
          <SectionHeading eyebrow="Just Listed" heading="See What's New on the Market" as="h2" />
          <p className="mt-4 max-w-xl font-sans text-base text-body">
            New Key West listings hit the market every day — browse the newest ones live from
            the Florida Keys MLS.
          </p>
        </div>
        <Link
          href="/search/new-24-hours"
          className="inline-flex min-h-11 shrink-0 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
        >
          View New Listings &rarr;
        </Link>
      </div>
    </section>
  );
}
