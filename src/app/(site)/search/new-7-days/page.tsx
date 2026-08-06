import type { Metadata } from "next";
import { QuickSearchResults } from "@/components/search/QuickSearchResults";
import { listingProvider } from "@/lib/listings/provider";

export const metadata: Metadata = {
  title: "New Listings in the Last 7 Days",
  description:
    "Browse Key West homes for sale listed in the last 7 days — a full week of new inventory, sorted newest first, from Royal Palms Realty.",
};

export const revalidate = 900;

export default async function New7DaysPage() {
  const listings = await listingProvider.getRecentSince(24 * 7);

  return (
    <QuickSearchResults
      heading="New in the Last 7 Days"
      intro="Every Key West listing that's hit the market in the past week — the widest practical view of what's genuinely new right now."
      listings={listings}
    />
  );
}
