// Neighborhood content — general, widely-known geographic/character
// descriptions only (no invented specifics like school names or flood zone
// letters). This is the definitive 8-tile list per Revision Round 2 (R6) —
// do not add neighborhoods back without client sign-off.
//
// imageDirection describes what the client's real photo should show —
// listed in the handover doc under TODO-CLIENT-ASSET so Scott knows exactly
// which 8 photos to supply. image/imageAlt are placeholder-until-supplied;
// NeighborhoodPhoto renders a designed placeholder whenever image is unset.
export type Neighborhood = {
  slug: string;
  name: string;
  tileBlurb: string;
  overview: string[];
  imageDirection: string;
  image?: string;
  imageAlt?: string;
  // True when `image` is a generic, licensed stock photo standing in until
  // Scott supplies a real photo of this specific area — NeighborhoodPhoto
  // shows a small "Representative photo" label whenever this is set, so a
  // generic image is never mistaken for an actual picture of the place.
  imageIsGeneric?: boolean;
  // Optional and left unset for Midtown East / New Town (added 2026-08-20) —
  // these were sample/placeholder numbers for the original 8, not real MLS
  // data (see the "Sample market data" disclosures already on both the grid
  // and detail pages). Don't invent numbers for these two just to fill the
  // type; render code must handle them being absent.
  medianPrice?: number;
  daysOnMarket?: number;
  activeInventory?: number;
};

export const neighborhoods: Neighborhood[] = [
  {
    slug: "old-town",
    name: "Old Town",
    tileBlurb: "Historic Conch houses, Duval Street, and Mallory Square.",
    imageDirection: "Conch house with gingerbread trim, Duval or Whitehead streetscape",
    image: "/neighborhoods/old-town.jpg",
    imageAlt: "Historic Conch houses lining a street in Old Town, Key West",
    overview: [
      "Old Town is Key West's historic core — narrow lanes lined with 19th-century Conch houses, gingerbread trim, and mature tropical landscaping, all within walking distance of Duval Street and Mallory Square.",
      "It's the most tourist-facing part of the island and one of the most residential at the same time: short-term rental and transient-licensed properties sit block-to-block with quiet family homes. Buyers come here for walkability, architectural character, and the ability to be part of the island's daily rhythm rather than removed from it.",
    ],
    medianPrice: 1650000,
    daysOnMarket: 62,
    activeInventory: 14,
  },
  {
    slug: "casa-marina",
    name: "Casa Marina",
    tileBlurb: "Beachfront estates near the historic Casa Marina Resort.",
    imageDirection: "Beachfront, palm-lined residential street, historic estate frontage",
    image: "/neighborhoods/casa-marina.jpg",
    imageAlt: "The historic Casa Marina resort and beachfront in Key West",
    overview: [
      "Casa Marina takes its name from the historic resort at its center and covers the beachfront district on Key West's Atlantic side. It's the closest thing the island has to a true beach neighborhood, with wider lots, mature landscaping, and direct or near-direct beach access.",
      "This is where Key West's largest and most architecturally significant homes tend to concentrate — a mix of restored historic estates and newer luxury construction, generally commanding the island's highest price points.",
    ],
    medianPrice: 3100000,
    daysOnMarket: 68,
    activeInventory: 8,
  },
  {
    slug: "the-meadows",
    name: "The Meadows",
    tileBlurb: "A leafy historic district known for its tree canopy.",
    imageDirection: "Quiet tree-canopied residential lane",
    image: "/neighborhoods/the-meadows.jpg",
    imageAlt: "A leafy, tree-canopied residential street in The Meadows, Key West",
    overview: [
      "The Meadows is a historic residential pocket within Old Town, distinguished by its dense tree canopy and Bahamian-influenced cottage architecture — smaller in scale than the grander Casa Marina estates, but just as historically protected.",
      "It's popular with buyers who want the character and walkability of Old Town in a quieter, more shaded residential setting away from the Duval Street crowds.",
    ],
    medianPrice: 1180000,
    daysOnMarket: 58,
    activeInventory: 9,
  },
  {
    slug: "truman-annex",
    name: "Truman Annex",
    tileBlurb: "Gated, waterfront, and steps from Fort Zachary Taylor.",
    imageDirection: "White colonnaded architecture, Presidential Gates, harbourfront",
    image: "/neighborhoods/truman-annex.jpg",
    imageAlt: "Gated waterfront homes in Truman Annex, Key West",
    overview: [
      "Truman Annex occupies what was once a naval property at the island's western tip, redeveloped into one of Key West's most exclusive gated communities. Streets are wide, quiet, and shaded, with direct proximity to Fort Zachary Taylor's beach and the Truman Waterfront.",
      "Homes here range from restored historic residences to purpose-built luxury construction, and the gated setting draws buyers who want Old Town's location without Old Town's density.",
    ],
    medianPrice: 2450000,
    daysOnMarket: 71,
    activeInventory: 6,
  },
  {
    slug: "sunset-key",
    name: "Sunset Key",
    tileBlurb: "A private island reached only by ferry.",
    imageDirection: "Island cottages from the water, ferry approach, sunset over the channel",
    image: "/neighborhoods/sunset-key.jpg",
    imageAlt: "Sunset Key's private island cottages in Key West",
    overview: [
      "Sunset Key is a private island a short ferry ride from Key West Bight, developed exclusively with luxury homes and a resort-operated cottage collection. There are no cars, no through traffic, and no public access — privacy is effectively the product.",
      "It's the most exclusive address in the Key West market, drawing buyers who want island living with a level of seclusion the main island simply can't offer.",
    ],
    medianPrice: 4200000,
    daysOnMarket: 84,
    activeInventory: 3,
  },
  {
    slug: "shark-key",
    name: "Shark Key",
    tileBlurb: "Gated waterfront estates on a private mangrove island.",
    imageDirection: "Gated waterfront estates, private beach, mangrove channel",
    image: "/neighborhoods/shark-key.jpg",
    imageAlt: "A gated waterfront estate on Shark Key, near Key West",
    overview: [
      "Shark Key is a small, gated island a short drive from Key West proper, developed exclusively with large waterfront estates set among protected mangrove channels. Access is restricted to residents and their guests.",
      "It draws buyers who want serious acreage and deep water access without being on the main island at all — a different trade than Sunset Key's walk-to-everything seclusion, closer in spirit to a private compound.",
    ],
    medianPrice: 3600000,
    daysOnMarket: 79,
    activeInventory: 4,
  },
  {
    slug: "key-haven",
    name: "Key Haven",
    tileBlurb: "A quieter island community connected by a short causeway.",
    imageDirection: "Canal-front homes with docks and boats",
    image: "/neighborhoods/key-haven.jpg",
    imageAlt: "Canal-front homes with private docks in Key Haven",
    overview: [
      "Key Haven sits just off Key West proper, connected by a short causeway — technically its own small island, and noticeably quieter and more suburban than anything in town.",
      "Canal-front lots with private docks are common here, making it a natural fit for boat owners who want deep water access without the density (or the price point) of Casa Marina or Truman Annex.",
    ],
    medianPrice: 1050000,
    daysOnMarket: 66,
    activeInventory: 5,
  },
  {
    slug: "midtown-west",
    name: "Midtown West",
    tileBlurb: "Newer single-family streets with a practical, residential feel.",
    imageDirection: "Newer single-family streets, practical residential character",
    image: "/neighborhoods/midtown-west.jpg",
    imageAlt: "A single-family residential street in Midtown West, Key West",
    overview: [
      "Midtown West sits toward the center of the island, built out with more conventional single-family homes than Old Town's historic Conch construction — practical, residential streets rather than tourist-facing ones.",
      "It's a natural fit for buyers who want to live on the island year-round without paying Old Town's premium, close enough to bike or drive into the historic district in minutes.",
    ],
    medianPrice: 780000,
    daysOnMarket: 49,
    activeInventory: 17,
  },
  {
    slug: "midtown-east",
    name: "Midtown East",
    tileBlurb: "The eastern half of Midtown, close to shopping and the airport.",
    imageDirection: "Practical single-family streets toward the island's east end",
    image: "/neighborhoods/midtown-east.jpg",
    imageAlt: "A Key West conch-style house with palm trees — a representative Keys residential scene",
    imageIsGeneric: true,
    overview: [
      "Midtown East covers the eastern stretch of Key West's Midtown area, generally closer to the airport and the island's shopping corridors than Midtown West.",
      "Like the rest of Midtown, it's built out with more conventional single-family homes than Old Town's historic construction — a practical, year-round residential option rather than a tourist-facing one.",
    ],
    // TODO-CLIENT-ASSET: general placeholder copy — Scott should review/refine
    // this one specifically; it's a less universally-documented boundary
    // than the other 9 and would benefit from his own on-the-ground read.
  },
  {
    slug: "new-town",
    name: "New Town",
    tileBlurb: "The island's newer eastern development, near the airport and big-box shopping.",
    imageDirection: "Newer commercial corridors and residential streets on the island's east end",
    image: "/neighborhoods/new-town.jpg",
    imageAlt: "A simple white Key West cottage with a palm tree — a representative Keys residential scene",
    imageIsGeneric: true,
    overview: [
      "New Town is the newer, eastern half of Key West — developed later than Old Town, with wider streets, more conventional construction, and easier parking, and home to the airport and most of the island's larger shopping.",
      "It's a common fit for buyers who want to live on the island year-round with more day-to-day convenience, trading Old Town's historic density for practicality.",
    ],
  },
];

export function getNeighborhood(slug: string) {
  return neighborhoods.find((n) => n.slug === slug);
}

export function getAdjacentNeighborhoods(slug: string, count = 3) {
  const currentIndex = neighborhoods.findIndex((n) => n.slug === slug);
  const rotated = [
    ...neighborhoods.slice(currentIndex + 1),
    ...neighborhoods.slice(0, currentIndex),
  ];
  return rotated.slice(0, count);
}
