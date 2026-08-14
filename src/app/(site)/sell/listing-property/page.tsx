import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export const metadata: Metadata = {
  title: "Listing Your Property",
};

export default function ListingPropertyPage() {
  return (
    <ComingSoonPage
      eyebrow="For Sellers"
      heading="Listing Your Property"
      utmContent="sell-listing-property-placeholder"
    />
  );
}
