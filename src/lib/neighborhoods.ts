// Neighborhood content — general, widely-known geographic/character
// descriptions only (no invented specifics like school names or flood zone
// letters). TODO-CLIENT-ASSET: replace with client-approved, fact-checked
// copy and confirm this is the complete list of tiles from the current site
// (build brief §7.5 — "retain all current neighborhood tiles").
export type Neighborhood = {
  slug: string;
  name: string;
  tileBlurb: string;
  overview: string[];
  medianPrice: number;
  daysOnMarket: number;
  activeInventory: number;
};

export const neighborhoods: Neighborhood[] = [
  {
    slug: "old-town",
    name: "Old Town",
    tileBlurb: "Historic Conch houses, Duval Street, and Mallory Square.",
    overview: [
      "Old Town is Key West's historic core — narrow lanes lined with 19th-century Conch houses, gingerbread trim, and mature tropical landscaping, all within walking distance of Duval Street and Mallory Square.",
      "It's the most tourist-facing part of the island and one of the most residential at the same time: short-term rental and transient-licensed properties sit block-to-block with quiet family homes. Buyers come here for walkability, architectural character, and the ability to be part of the island's daily rhythm rather than removed from it.",
    ],
    medianPrice: 1650000,
    daysOnMarket: 62,
    activeInventory: 14,
  },
  {
    slug: "new-town",
    name: "New Town",
    tileBlurb: "Residential, newer construction, closer to the airport.",
    overview: [
      "New Town sits on the island's eastern half, developed later than Old Town and built out with more conventional single-family homes, townhomes, and condos rather than historic Conch construction.",
      "It's the more practical side of Key West — closer to the airport, big-box shopping, and schools, with less exposure to the tourist foot traffic that defines Old Town. It suits buyers who want to live on the island without living in the middle of its nightlife.",
    ],
    medianPrice: 895000,
    daysOnMarket: 54,
    activeInventory: 21,
  },
  {
    slug: "truman-annex",
    name: "Truman Annex",
    tileBlurb: "Gated, waterfront, and steps from Fort Zachary Taylor.",
    overview: [
      "Truman Annex occupies what was once a naval property at the island's western tip, redeveloped into one of Key West's most exclusive gated communities. Streets are wide, quiet, and shaded, with direct proximity to Fort Zachary Taylor's beach and the Truman Waterfront.",
      "Homes here range from restored historic residences to purpose-built luxury construction, and the gated setting draws buyers who want Old Town's location without Old Town's density.",
    ],
    medianPrice: 2450000,
    daysOnMarket: 71,
    activeInventory: 6,
  },
  {
    slug: "casa-marina",
    name: "Casa Marina",
    tileBlurb: "Beachfront estates near the historic Casa Marina Resort.",
    overview: [
      "Casa Marina takes its name from the historic resort at its center and covers the beachfront district on Key West's Atlantic side. It's the closest thing the island has to a true beach neighborhood, with wider lots, mature landscaping, and direct or near-direct beach access.",
      "This is where Key West's largest and most architecturally significant homes tend to concentrate — a mix of restored historic estates and newer luxury construction, generally commanding the island's highest price points.",
    ],
    medianPrice: 3100000,
    daysOnMarket: 68,
    activeInventory: 8,
  },
  {
    slug: "midtown",
    name: "Midtown",
    tileBlurb: "Centrally located, residential, and convenient.",
    overview: [
      "Midtown sits between Old Town and New Town, geographically and in character — close enough to walk or bike into the historic district, but built with the calmer, more residential streets of the island's newer development.",
      "It's a practical choice for buyers who want central access without paying Old Town's premium, and it sees a steady mix of year-round residents and second-home owners.",
    ],
    medianPrice: 780000,
    daysOnMarket: 49,
    activeInventory: 17,
  },
  {
    slug: "the-meadows",
    name: "The Meadows",
    tileBlurb: "A leafy historic district known for its tree canopy.",
    overview: [
      "The Meadows is a historic residential pocket within Old Town, distinguished by its dense tree canopy and Bahamian-influenced cottage architecture — smaller in scale than the grander Casa Marina estates, but just as historically protected.",
      "It's popular with buyers who want the character and walkability of Old Town in a quieter, more shaded residential setting away from the Duval Street crowds.",
    ],
    medianPrice: 1180000,
    daysOnMarket: 58,
    activeInventory: 9,
  },
  {
    slug: "bahama-village",
    name: "Bahama Village",
    tileBlurb: "Colorful architecture and deep Afro-Bahamian heritage.",
    overview: [
      "Bahama Village, on Old Town's western edge, carries one of the island's richest cultural histories — settled by Bahamian immigrants and still known today for its brightly painted shotgun houses, narrow lanes, and strong sense of community identity.",
      "Property here tends to be smaller and more attainable than the grander Old Town estates nearby, while still sitting inside easy walking distance of Duval Street and the Historic Seaport.",
    ],
    medianPrice: 920000,
    daysOnMarket: 55,
    activeInventory: 7,
  },
  {
    slug: "key-haven",
    name: "Key Haven",
    tileBlurb: "A quieter island community connected by a short causeway.",
    overview: [
      "Key Haven sits just off Key West proper, connected by a short causeway — technically its own small island, and noticeably quieter and more suburban than anything in town.",
      "Canal-front lots with private docks are common here, making it a natural fit for boat owners who want deep water access without the density (or the price point) of Casa Marina or Truman Annex.",
    ],
    medianPrice: 1050000,
    daysOnMarket: 66,
    activeInventory: 5,
  },
  {
    slug: "stock-island",
    name: "Stock Island",
    tileBlurb: "Working waterfront, marinas, and an evolving character.",
    overview: [
      "Stock Island sits just north of Key West and has historically been the island's working waterfront — commercial fishing docks, boatyards, and marinas, with a more industrial, unpolished character than the rest of the Keys.",
      "It's also the area seeing the most change: new marina developments and mixed-use projects have started drawing buyers priced out of Key West proper, betting on the island's continued growth.",
    ],
    medianPrice: 610000,
    daysOnMarket: 47,
    activeInventory: 11,
  },
  {
    slug: "sunset-key",
    name: "Sunset Key",
    tileBlurb: "A private island reached only by ferry.",
    overview: [
      "Sunset Key is a private island a short ferry ride from Key West Bight, developed exclusively with luxury homes and a resort-operated cottage collection. There are no cars, no through traffic, and no public access — privacy is effectively the product.",
      "It's the most exclusive address in the Key West market, drawing buyers who want island living with a level of seclusion the main island simply can't offer.",
    ],
    medianPrice: 4200000,
    daysOnMarket: 84,
    activeInventory: 3,
  },
  {
    slug: "historic-seaport",
    name: "Historic Seaport",
    tileBlurb: "Key West Bight's harbor district of docks and dining.",
    overview: [
      "The Historic Seaport centers on Key West Bight — the working harbor turned lively district of waterfront restaurants, charter boats, and live music, just north of Duval Street.",
      "Residential inventory here is limited and mostly vertical (condos and lofts above or near the commercial harbor frontage), appealing to buyers who want to be in the middle of the island's waterfront energy rather than removed from it.",
    ],
    medianPrice: 1350000,
    daysOnMarket: 60,
    activeInventory: 4,
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
