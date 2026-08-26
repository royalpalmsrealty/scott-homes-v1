import type { Metadata } from "next";
import { QuickSearchResults } from "@/components/search/QuickSearchResults";
import { fetchIdxListings } from "@/lib/listings/idxScrape";

export const metadata: Metadata = {
  title: "Newest Listings",
  description:
    "Browse the newest Key West homes for sale on the market right now, sorted newest first.",
};

export const dynamic = "force-dynamic"; // always a live MLS lookup

export default async function New24HoursPage() {
  let listings: Awaited<ReturnType<typeof fetchIdxListings>> = [];
  let fetchError = false;
  try {
    listings = await fetchIdxListings({ sort: "newest" }, 12);
  } catch (err) {
    console.error("New-24-hours page listings fetch failed", err);
    fetchError = true;
  }

  return (
    <QuickSearchResults
      heading="New in the Last 24 Hours"
      intro="The freshest listings on the market, sorted newest first. IDX Broker doesn't give us an exact listing timestamp, so this shows the most recently listed homes rather than a strict 24-hour cutoff."
      listings={listings}
      backHref="/search/new-24-hours"
      backLabel="Back to New Listings"
      fetchError={fetchError}
    />
  );
}
