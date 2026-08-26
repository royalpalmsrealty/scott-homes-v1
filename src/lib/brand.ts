// Single source of truth for NAP (Name/Address/Phone) and broker details.
// Referenced by header, footer, contact page, and schema — never hardcode these elsewhere.
export const brand = {
  brokerage: "Royal Palms Realty",
  broker: {
    name: "Scott Forman",
    title: "Broker/Owner, Principal Broker",
    license: "BK #3045796",
  },
  phone: {
    display: "305-923-9884",
    href: "tel:3059239884",
  },
  email: {
    display: "Scott@royalpalmsrealty.com",
    href: "mailto:Scott@royalpalmsrealty.com",
  },
  address: {
    line1: "933 Fleming Street, Suite A",
    // TODO-CLIENT-ASSET: client-supplied ZIP was 33030 (Homestead, FL) — confirmed
    // placeholder is 33040 (Key West) pending client confirmation. Do not launch
    // without verifying; wrong NAP data breaks local SEO.
    city: "Key West",
    state: "FL",
    zip: "33040",
    get full() {
      return `${this.line1}, ${this.city}, ${this.state} ${this.zip}`;
    },
  },
} as const;

// R11 (Revision Round 2) is explicit: exactly one account per platform —
// Instagram, Facebook, LinkedIn, YouTube — no more, no less. Empty string =
// unconfirmed; SocialLinks hides the icon entirely rather than rendering a
// dead link. instagram is empty because no working link/handle ever came
// through as text (only broken image attachments) — confirm before launch.
//
// tiktok is kept here (real, client-supplied handle) but intentionally left
// out of SocialLinks/sameAs per R11's 4-platform list — flagged, not deleted,
// in case the client wants it added back to that list explicitly.
export const social = {
  instagram: "",
  facebook: "https://www.facebook.com/share/19Mq7D4Yyj/?mibextid=wwXIfr",
  linkedin: "https://www.linkedin.com/in/scott-forman-473681b",
  youtube: "https://www.youtube.com/@sforman789",
  tiktok: "https://www.tiktok.com/@scottforman11",
} as const;

// The definitive R11 platform order — every "one icon per platform" render
// (footer, /about/scott-forman) should read from this, not from `social`
// directly, so dropping a URL back to "" is the only step needed to hide it.
export const socialPlatforms = [
  { key: "instagram", label: "Instagram", url: social.instagram },
  { key: "facebook", label: "Facebook", url: social.facebook },
  { key: "linkedin", label: "LinkedIn", url: social.linkedin },
  { key: "youtube", label: "YouTube", url: social.youtube },
] as const;

export const rentalBookingUrl = "https://book.hostfully.com/royal-palms-realty/search";

// The "Buyers" and "Sellers" nav items are dropdowns, not plain links — built
// out one entry at a time as the client supplies content for each.
export const buyersMenu = [
  { label: "Utility Setup", href: "/buyers/utility-setup" },
  { label: "Homestead Info", href: "/buyers/homestead-info" },
  { label: "HARC Guidelines", href: "/buyers/harc-guidelines" },
] as const;

export const sellMenu = [
  { label: "Listing Property", href: "/sell/listing-property" },
  { label: "Sell Faster", href: "/sell/sell-faster" },
  { label: "Open House Tips", href: "/sell/open-house-tips" },
  { label: "Showing Guide", href: "/sell/showing-guide" },
] as const;

export const primaryNav = [
  { label: "Search", href: "/search" },
  { label: "Neighborhoods", href: "/neighborhoods" },
  { label: "Featured", href: "/featured" },
  { label: "Sold Listings", href: "/sold" },
  { label: "Rentals", href: "/rentals" },
  { label: "Buyers", children: buyersMenu },
  { label: "Sellers", children: sellMenu },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
