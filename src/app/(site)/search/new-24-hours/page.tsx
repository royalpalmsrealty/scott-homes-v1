import type { Metadata } from "next";
import { QuickSearchResults } from "@/components/search/QuickSearchResults";
import { listingProvider } from "@/lib/listings/provider";

export const metadata: Metadata = {
  title: "New Listings in the Last 24 Hours",
  description:
    "Browse Key West homes for sale listed in the last 24 hours — the newest inventory on the market, updated continuously by Royal Palms Realty.",
};

export const revalidate = 900;

export default async function New24HoursPage() {
  const listings = await listingProvider.getRecentSince(24);

  return (
    <QuickSearchResults
      heading="New in the Last 24 Hours"
      intro="The newest Key West listings on the market — anything that hit the MLS in the last day, sorted newest first."
      listings={listings}
    />
  );
}
