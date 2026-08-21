// Stand-in for CMS-editable site settings until a real CMS is installed
// (Revision Round 2 decision: lightweight config now, real CMS later — see
// D2). A developer edits this file directly today; the shape here is exactly
// what would become CMS fields, so wiring a real CMS later is a data-source
// swap, not a rewrite.

export type HeroMedia =
  | { type: "image"; image: string; imageAlt: string }
  | {
      type: "video";
      poster: string;
      posterAlt: string;
      videoDesktop: string;
      videoMobile?: string;
    };

// R9: toggling this single field between "image" and "video" is the entire
// CMS-editable mechanism — no code change required either way.
export const heroMedia: HeroMedia = {
  type: "video",
  poster: "/images/hero-poster.jpg",
  posterAlt: "Bright living room interior in a Key West home",
  videoDesktop: "/video/hero.mp4",
};

// R5: Calendly link lives in one place — every scheduling entry point reads
// this field, never a hardcoded URL.
export const calendlyUrl = "https://calendly.com/scott-royalpalmsrealty/15min";

// R1: the AI writer's house-style system prompt, editable without touching
// code — this is the one field Scott should be able to tune the voice
// through once a real admin exists. Seeded per the brief's spec.
export const blogHouseStylePrompt = `Write as Scott Forman, broker/owner of Royal Palms Realty, in first person, as a genuine local authority on Key West real estate.

Voice: specific over generic. Never use real-estate cliché phrases — no "nestled", "boasts", "hidden gem", "won't last long", "charming". Write like someone who actually knows the island, not like a listing description.

Length: 800–1400 words. Always close with a clear call to action.

Never state a market statistic, price, or date as fact unless it was given to you directly in the topic/brief or comes from real listing data. If you'd need a number you don't have, write [VERIFY: what you'd need to check] instead of guessing — this is a hard rule, not a suggestion.`;

// Turned on per Scott's request (2026-08-18) — schedule lives in vercel.json
// (currently Mondays). The generated draft always lands as pending_approval,
// never published automatically; see api/cron/blog-draft/route.ts.
export const weeklyAutoDraftEnabled = true;
