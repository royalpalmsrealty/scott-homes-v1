import type { Metadata } from "next";
import { QuickSearchResults } from "@/components/search/QuickSearchResults";
import { fetchIdxListings } from "@/lib/listings/idxScrape";

export const metadata: Metadata = {
  title: "Newest Listings This Week",
  description:
    "Browse a broader set of the newest Key West homes for sale on the market, sorted newest first.",
};

export const dynamic = "force-dynamic"; // always a live MLS lookup

export default async function New7DaysPage() {
  const listings = await fetchIdxListings({ sort: "newest" }, 24).catch(() => []);

  return (
    <QuickSearchResults
      heading="New in the Last 7 Days"
      intro="A broader look at what's newest on the market, sorted newest first — same live feed as the 24-hour view, just more of it. IDX Broker doesn't give us an exact listing timestamp, so this can't be sliced to a strict 7-day cutoff."
      listings={listings}
      backHref="/search/new-7-days"
      backLabel="Back to New Listings"
    />
  );
}
