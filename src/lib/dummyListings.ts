// Dummy data only — no real MLS feed yet (lands once a ListingProvider is
// wired to a real IDX/MLS source, see src/lib/listings/provider.ts).
// Addresses, prices, and specs are all placeholders for layout purposes.
// Photos are stand-in interiors (people-free frames pulled from the hero
// video) — not the actual property at that address. Swap for real MLS photos
// once the feed is wired up. Neighborhoods are restricted to the R6
// definitive 8-tile list.
export type DummyListing = {
  id: string;
  address: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  status?: "Transient-Licensed" | "Pending";
  /** ISO timestamp — drives "New" ribbon (<48h old) and newest-first sort. */
  listedAt: string;
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
    listedAt: "2026-08-05T14:00:00Z",
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
    listedAt: "2026-07-28T09:00:00Z",
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
    listedAt: "2026-08-06T08:00:00Z",
  },
  {
    id: "4",
    address: "3 Ferry Ln",
    neighborhood: "Sunset Key",
    price: 4350000,
    beds: 4,
    baths: 4,
    sqft: 3100,
    image: "/images/dummy-listing-4.jpg",
    listedAt: "2026-08-04T12:00:00Z",
  },
  {
    id: "5",
    address: "77 Flagler Ave",
    neighborhood: "Midtown West",
    price: 749000,
    beds: 3,
    baths: 2,
    sqft: 1400,
    image: "/images/dummy-listing-5.jpg",
    status: "Pending",
    listedAt: "2026-07-20T09:00:00Z",
  },
  {
    id: "6",
    address: "19 Coral Way",
    neighborhood: "Shark Key",
    price: 3675000,
    beds: 4,
    baths: 3.5,
    sqft: 2650,
    image: "/images/dummy-listing-6.jpg",
    listedAt: "2026-08-05T20:00:00Z",
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
    listedAt: "2026-07-15T09:00:00Z",
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
    listedAt: "2026-08-03T09:00:00Z",
  },
  {
    id: "9",
    address: "610 Fleming St",
    neighborhood: "Old Town",
    price: 1425000,
    beds: 3,
    baths: 2,
    sqft: 1590,
    image: "/images/dummy-listing-5.jpg",
    listedAt: "2026-08-06T02:00:00Z",
  },
];
