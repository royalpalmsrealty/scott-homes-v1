// Single source of truth for NAP (Name/Address/Phone) and broker details.
// Referenced by header, footer, contact page, and schema — never hardcode these elsewhere.
export const brand = {
  brokerage: "Royal Palms Realty",
  broker: {
    name: "Scott Forman",
    title: "Broker/Owner, Principal Broker",
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

// Confirmed with the client. Instagram was referenced but no working
// link/handle came through as text — add it here once we have one.
export const social = {
  facebook: "https://www.facebook.com/share/19Mq7D4Yyj/?mibextid=wwXIfr",
  linkedin: "https://www.linkedin.com/in/scott-forman-473681b",
  youtube: "https://www.youtube.com/@sforman789",
  tiktok: "https://www.tiktok.com/@scottforman11",
} as const;

export const rentalBookingUrl = "https://book.hostfully.com/royal-palms-realty/search";

export const primaryNav = [
  { label: "Search", href: "/search" },
  { label: "Neighborhoods", href: "/neighborhoods" },
  { label: "Rentals", href: "/rentals" },
  { label: "Sell", href: "/sell" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
