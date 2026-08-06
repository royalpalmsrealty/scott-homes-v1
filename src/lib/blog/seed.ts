import type { BlogPost } from "./types";

// Seed content for the JSON-backed store's first run. Genuine, safe
// informational writing only — no fabricated prices or market statistics,
// consistent with the AI writer's own guardrail (see aiWriter.ts).
export const seedPosts: BlogPost[] = [
  {
    id: "seed-1",
    slug: "moving-to-key-west-what-to-know",
    title: "5 Things to Know Before Moving to Key West",
    seoTitle: "5 Things to Know Before Moving to Key West | Royal Palms Realty",
    metaDescription:
      "Thinking about relocating to Key West? Here's what actually changes about daily life — flood zones, hurricane season, island logistics, and more.",
    category: "Lifestyle",
    tags: ["relocation", "island-living", "key-west"],
    author: "Scott Forman",
    coverImageAlt: "Palm-lined residential street in Key West",
    status: "published",
    createdAt: "2026-06-02T14:00:00Z",
    publishedAt: "2026-06-04T09:00:00Z",
    ctaText: "Curious what your move to Key West could look like? Talk to Scott",
    ctaHref: "/contact",
    verifyWarnings: [],
    relatedSlugs: ["transient-rental-license-explained"],
    body: `Every year, people fall in love with Key West on vacation and start seriously asking the question: could I actually live here? The honest answer is yes, plenty of people do — but island life changes a few things about daily logistics that are worth knowing before you commit.

## Everything Ships In

Key West sits at the end of the Overseas Highway, roughly a four-hour drive from Miami. Most goods — groceries, building materials, furniture — travel that same road. It doesn't make daily life impractical, but it does mean patience matters for anything custom-ordered, and it's part of why home renovations here often take longer than they would on the mainland.

## Flood Zones Are a Real Conversation, Not a Footnote

Because the island sits low and close to the water, flood zone designation affects insurance costs meaningfully more here than in most U.S. markets. It's not a reason to avoid buying — it's a reason to ask about it early, for any specific property, rather than after you've fallen in love with a listing.

## Hurricane Season Shapes the Calendar

Atlantic hurricane season runs June through November, and living on the island means having an actual plan — not a vague one — for evacuation and storm prep. Most full-time residents treat this the way anyone else treats winter: a predictable seasonal reality you plan around, not a source of constant anxiety.

## The Community Is Smaller Than It Looks on Instagram

Duval Street is the tourist-facing version of Key West. The residential side of the island — Old Town's quieter blocks, the neighborhoods further from the water — has a genuinely tight-knit, small-town feel. You will run into people you know at the grocery store. For a lot of people, that's exactly the draw.

## Short-Term Rental Rules Vary Block by Block

Not every property on the island can legally be rented out short-term. Transient licenses are property-specific, tied to zoning, and they matter enormously if part of your plan involves renting the place out when you're not there. If that's part of your thinking, ask about a property's license status before you get attached to it — it's one of the first things worth checking, not one of the last.

Moving to a small island is a different kind of decision than moving to a new house on the mainland. If you're weighing it seriously, it's worth talking through with someone who lives the realities of it daily, not just the highlight reel.`,
  },
  {
    id: "seed-2",
    slug: "transient-rental-license-explained",
    title: "What Is a Transient Rental License, and Why Does It Matter?",
    seoTitle: "Transient Rental License in Key West, Explained | Royal Palms Realty",
    metaDescription:
      "If you're buying in Key West with rental income in mind, understanding transient licenses is essential. Here's what the term actually means.",
    category: "Buying",
    tags: ["transient-license", "investment", "key-west"],
    author: "Scott Forman",
    coverImageAlt: "Conch house with a rental sign in Key West",
    status: "published",
    createdAt: "2026-05-20T10:00:00Z",
    publishedAt: "2026-05-22T09:00:00Z",
    ctaText: "Looking for a transient-licensed property? See what's active",
    ctaHref: "/search",
    verifyWarnings: [],
    relatedSlugs: ["moving-to-key-west-what-to-know"],
    body: `If you've spent any time browsing Key West listings, you've probably seen the phrase "transient license" attached to certain properties — often with a noticeably higher price tag attached, too. Here's what it actually means, and why it matters so much in this specific market.

## The Short Version

A transient rental license is a permit tied to a specific property that allows it to be rented out short-term — think days or weeks, the way a hotel room or vacation rental works, rather than a traditional month-to-month or annual lease.

## Why It's Not Just a Formality

In most of the country, short-term rental rules are a matter of city ordinance that can shift with local politics. In Key West, the number of transient licenses has been effectively capped for years, which means the license itself has real, durable value — it's attached to the property, not the owner, and it doesn't get created on demand.

That scarcity is exactly why a transient-licensed property commands a premium over an otherwise-identical home without one. You're not just buying a house — you're buying the house and a limited, non-renewable right that comes with it.

## What This Means If You're Buying for Investment

If a rental income strategy is part of your plan, the license status of a specific property is one of the first things to confirm — not a detail to sort out after closing. A property advertised as having rental potential needs the license to actually deliver on that; without it, you're limited to longer-term leases, which is a meaningfully different investment case.

## What This Means If You're Just Buying a Home

Even if renting isn't part of your plan, license status still affects resale value and the pool of future buyers for the property — worth knowing even for a straightforward personal-residence purchase.

If you're looking specifically for transient-licensed inventory, it's worth working with someone who tracks which properties actually carry the license, since it's not always obvious from a listing photo.`,
  },
  {
    id: "seed-3",
    slug: "old-town-vs-new-town",
    title: "Old Town vs. New Town: Which Side of the Island Fits You?",
    seoTitle: "Old Town vs. New Town Key West: A Buyer's Comparison | Royal Palms Realty",
    metaDescription:
      "Old Town or New Town? A practical look at how the two halves of Key West actually differ for someone deciding where to buy.",
    category: "Neighborhood Guides",
    tags: ["old-town", "neighborhoods", "buying"],
    author: "Scott Forman",
    status: "pending_approval",
    createdAt: "2026-08-01T11:00:00Z",
    verifyWarnings: ["[VERIFY: current median price gap between Old Town and New Town]"],
    body: `Every Key West buyer eventually asks some version of the same question: Old Town, or somewhere newer? It's less about which is "better" and more about which trade-offs fit how you actually want to live.

## Old Town: Character, Walkability, Density

Old Town is the historic core — Conch houses, narrow lanes, walking distance to Duval Street and the harbor. It's the version of Key West most people picture. The trade-off is density: smaller lots, closer neighbors, and a construction/renovation process shaped by historic-preservation rules that newer parts of the island don't have to navigate.

## New Town: Space, Practicality, Convenience

The island's eastern half was developed later, with more conventional single-family construction, easier parking, and closer proximity to the airport and everyday shopping. It's the more practical choice for buyers who want to live on the island without living in the middle of its tourist activity.

## The Price Gap Is Real But Not Simple

[VERIFY: current median price gap between Old Town and New Town]

## Which One Is Actually Right for You

If daily walkability and historic character matter more to you than square footage, Old Town tends to win that trade every time. If space, ease of renovation, and practical day-to-day logistics matter more, New Town is usually the better fit — and plenty of buyers split the difference by looking at Midtown instead.`,
  },
];
