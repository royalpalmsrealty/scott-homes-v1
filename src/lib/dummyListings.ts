// Dummy data only — no real MLS feed yet (lands in Phase 4, build brief §10).
// Addresses, prices, and specs are all placeholders for layout purposes.
// Photos are stand-in interiors (people-free frames pulled from the hero
// video) — not the actual property at that address. Swap for real MLS photos
// once the feed is wired up.
export type DummyListing = {
  id: string;
  address: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  status?: "New" | "Transient-Licensed" | "Pending";
};

export const dummyListings: DummyListing[] = [
  {
    id: "1",
    address: "421 Simonton St",
    neighborhood: "Old Town",
    price: 1895000,
    beds: 3,
    baths: 2,
    sqft: 1780,
    image: "/images/dummy-listing-1.jpg",
    status: "New",
  },
  {
    id: "2",
    address: "88 Seaside Ave",
    neighborhood: "Casa Marina",
    price: 3250000,
    beds: 4,
    baths: 3.5,
    sqft: 2900,
    image: "/images/dummy-listing-2.jpg",
    status: "Transient-Licensed",
  },
  {
    id: "3",
    address: "12 Front St",
    neighborhood: "Truman Annex",
    price: 1120000,
    beds: 2,
    baths: 2,
    sqft: 1150,
    image: "/images/dummy-listing-3.jpg",
    status: "New",
  },
  {
    id: "4",
    address: "305 United St",
    neighborhood: "Bahama Village",
    price: 895000,
    beds: 2,
    baths: 1,
    sqft: 980,
    image: "/images/dummy-listing-4.jpg",
  },
  {
    id: "5",
    address: "77 Flagler Ave",
    neighborhood: "Midtown",
    price: 749000,
    beds: 3,
    baths: 2,
    sqft: 1400,
    image: "/images/dummy-listing-5.jpg",
    status: "Pending",
  },
  {
    id: "6",
    address: "19 Golf Club Dr",
    neighborhood: "New Town",
    price: 1450000,
    beds: 3,
    baths: 2.5,
    sqft: 1960,
    image: "/images/dummy-listing-6.jpg",
    status: "Transient-Licensed",
  },
  {
    id: "7",
    address: "9 Petronia St",
    neighborhood: "The Meadows",
    price: 1180000,
    beds: 2,
    baths: 2,
    sqft: 1240,
    image: "/images/dummy-listing-1.jpg",
    status: "New",
  },
  {
    id: "8",
    address: "44 Sea Isle Dr",
    neighborhood: "Key Haven",
    price: 1050000,
    beds: 3,
    baths: 2,
    sqft: 1620,
    image: "/images/dummy-listing-3.jpg",
  },
  {
    id: "9",
    address: "6 Shrimp Rd",
    neighborhood: "Stock Island",
    price: 610000,
    beds: 2,
    baths: 1,
    sqft: 890,
    image: "/images/dummy-listing-5.jpg",
    status: "New",
  },
];
