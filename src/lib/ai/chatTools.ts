import type { ToolDef } from "./toolTypes";
import { getNeighborhood, neighborhoods } from "@/lib/neighborhoods";
import { buildIdxSearchUrl, getNeighborhoodFilterStatus } from "@/lib/listings/idxSearch";
import { fetchIdxResultsCount } from "@/lib/listings/idxScrape";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";
import { queueLead } from "@/lib/leadQueue";

const neighborhoodNames = neighborhoods.map((n) => n.name);

export const CHAT_TOOLS: ToolDef[] = [
  {
    name: "searchListings",
    description: "Check how many current Key West listings match a neighborhood, price range, bedroom count, and/or condo/waterfront, and get a live link to view them. Every filter is OPTIONAL — omit each one entirely unless the visitor actually said that specific thing in this conversation; leaving filters out for a citywide question is correct, not incomplete. Returns a real live count from the MLS — the UI automatically shows a clickable button linking to the actual results below your reply, so just tell the visitor how many matched; never write your own link, URL, or markdown link syntax in your reply (it won't render as clickable), and never describe individual properties (address, photos, exact features) since this tool doesn't return that — it's a count and a link only.",
    input_schema: {
      type: "object",
      properties: {
        // Forces evidence instead of a bare guess: this is checked in code,
        // and neighborhood is dropped entirely unless the quote is a real
        // substring of what the visitor actually typed. Concrete fix for a
        // real, repeatedly observed failure mode (confirmed live 2026-09-09)
        // where the model picked a specific neighborhood — and even added a
        // price cap — for citywide questions that named neither, despite
        // explicit prompt instructions not to; those instructions alone
        // didn't reliably stop it, this does.
        neighborhoodQuote: {
          type: "string",
          description: `The exact substring of the visitor's own message that names the neighborhood, verbatim — e.g. if they wrote "old town", quote "old town", not "Old Town". Omit entirely if they didn't name a specific neighborhood; do not quote your own inference.`,
        },
        // If the visitor names a real place that isn't one of these exact
        // options (e.g. "Boca Chica", "Big Pine Key"), do not pick the
        // nearest-sounding option from this list — omit neighborhood
        // entirely and tell them it's not one of the specifically tracked
        // neighborhoods, rather than silently substituting a different one.
        neighborhood: { type: "string", enum: neighborhoodNames },
        priceQuote: {
          type: "string",
          description: `The exact substring of the visitor's own message that states a price/budget, verbatim (e.g. "under 2 million", "$2M budget"). Required if minPrice or maxPrice is set — omit all three together if no price was mentioned.`,
        },
        minPrice: { type: "number" },
        maxPrice: { type: "number" },
        bedsQuote: {
          type: "string",
          description: `The exact substring of the visitor's own message that states a bedroom count, verbatim (e.g. "3 bedroom", "at least 2 beds"). Required if beds is set.`,
        },
        beds: { type: "number" },
        condo: { type: "boolean" },
        waterfront: { type: "boolean" },
      },
    },
  },
  {
    name: "getNeighborhoodInfo",
    description: "Get overview, character, and market data for one of Royal Palms Realty's 8 covered neighborhoods.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string", enum: neighborhoodNames } },
      required: ["name"],
    },
  },
  {
    name: "captureLead",
    description: "Call this once you've gathered enough about a visitor to be worth passing to Scott — name and email at minimum. Do this conversationally, after being useful at least once, not as an interrogation up front.",
    input_schema: {
      type: "object",
      properties: {
        intent: { type: "string", enum: ["buyer", "seller", "rental", "general"] },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        timeline: { type: "string" },
        budget: { type: "string" },
        financing: { type: "string" },
        neighborhoodInterest: { type: "string" },
        notes: { type: "string" },
      },
      required: ["intent", "name", "email"],
    },
  },
  {
    name: "offerScheduling",
    description: "Call this when the visitor wants to talk to Scott directly. This hands off to the real Calendly booking widget — it does not book anything itself. Tell the visitor you're opening the scheduler for them.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
      },
    },
  },
];

export type ClientAction =
  | { type: "searchResults"; count: number; isMinimum: boolean; url: string }
  | { type: "open_scheduling"; prefill: { name?: string; email?: string } };

// Confirmed live 2026-09-09: telling the model not to invent a filter for
// citywide questions wasn't reliable on its own — it kept picking a
// neighborhood and a price cap anyway. Requiring it to quote the visitor's
// own words, and actually checking that quote against what they typed,
// catches what the instruction alone didn't: if there's no quote, or the
// quote doesn't really appear in their message, the filter is dropped
// rather than trusted.
function quotedByVisitor(quote: unknown, lastUserMessage: string): boolean {
  const q = typeof quote === "string" ? quote.trim().toLowerCase() : "";
  return Boolean(q) && lastUserMessage.toLowerCase().includes(q);
}

export async function executeChatTool(
  name: string,
  input: Record<string, unknown>,
  context: { lastUserMessage: string }
): Promise<{ result: unknown; clientAction?: ClientAction }> {
  switch (name) {
    case "searchListings": {
      const neighborhoodQuote = typeof input.neighborhoodQuote === "string" ? input.neighborhoodQuote.trim().toLowerCase() : "";
      // Confirmed live 2026-09-09: quoting the visitor's words alone wasn't
      // enough — asked about "Boca Chica" (a real place, but not one of our
      // 10 tracked neighborhoods), the model correctly quoted "Boca Chica"
      // but paired it with a completely unrelated enum value ("New Town")
      // instead of admitting it isn't tracked. Requiring the quote to
      // actually overlap the *chosen* neighborhood's own name (not just
      // appear somewhere in the message) catches a mismatched pairing like
      // that, not just a missing quote.
      const neighborhoodCandidate = input.neighborhood as string | undefined;
      const neighborhoodConfirmed =
        quotedByVisitor(input.neighborhoodQuote, context.lastUserMessage) &&
        Boolean(neighborhoodCandidate) &&
        (neighborhoodQuote.includes(neighborhoodCandidate!.toLowerCase()) ||
          neighborhoodCandidate!.toLowerCase().includes(neighborhoodQuote));
      const priceConfirmed = quotedByVisitor(input.priceQuote, context.lastUserMessage);
      const bedsConfirmed = quotedByVisitor(input.bedsQuote, context.lastUserMessage);
      const neighborhood = neighborhoodConfirmed ? neighborhoodCandidate : undefined;

      // Same rule as every other page on the site (client-reported bug fix,
      // 2026-08-22): never silently widen to all of Key West when a named
      // neighborhood can't be filtered precisely — tell the model so it can
      // say that honestly instead of presenting an unrelated count.
      if (neighborhood && !getNeighborhoodFilterStatus(neighborhood).available) {
        return {
          result: {
            error: `Live MLS search can't be narrowed to "${neighborhood}" specifically right now — don't state a count or offer results for it. Suggest a different neighborhood or a general search instead.`,
          },
        };
      }

      const filters = {
        neighborhood: neighborhood ?? null,
        minPrice: priceConfirmed ? (input.minPrice as number | undefined) ?? null : null,
        maxPrice: priceConfirmed ? (input.maxPrice as number | undefined) ?? null : null,
        minBeds: bedsConfirmed ? (input.beds as number | undefined) ?? null : null,
        condo: Boolean(input.condo),
        waterfront: Boolean(input.waterfront),
      };

      try {
        const { count, isMinimum } = await fetchIdxResultsCount(filters);
        const url = buildIdxSearchUrl(filters);
        const result: Record<string, unknown> = { count, isMinimum, scope: neighborhood ?? "all of Key West (citywide)" };
        // The model asked for a specific neighborhood but it got rejected
        // above (unconfirmed quote, or a real place we don't track) — tell
        // it explicitly, or it'll describe a citywide count as if it were
        // scoped to the place it originally asked about.
        if (neighborhoodCandidate && !neighborhoodConfirmed) {
          result.note = `"${neighborhoodCandidate}" isn't one of the specifically tracked neighborhoods (or wasn't clearly stated) — this count is citywide, not scoped to it. Tell the visitor that plainly instead of attributing this number to that place.`;
        }
        return { result, clientAction: { type: "searchResults", count, isMinimum, url } };
      } catch {
        return { result: { error: "Couldn't reach the live MLS feed just now — tell the visitor to try again in a moment, don't guess a count." } };
      }
    }

    case "getNeighborhoodInfo": {
      const neighborhood = getNeighborhood(
        neighborhoods.find((n) => n.name === input.name)?.slug ?? ""
      );
      if (!neighborhood) return { result: { error: "Neighborhood not found" } };
      return {
        result: {
          name: neighborhood.name,
          overview: neighborhood.overview,
          // Deliberately omitted rather than passed as undefined: these are
          // placeholder sample numbers on the 8 original neighborhoods (not
          // real MLS data — see the "Sample market data" disclosures on the
          // public pages) and were never set at all for the 2 added
          // 2026-08-20. The chat system prompt's hard rule against stating
          // unverified statistics as fact means the model shouldn't have
          // these fed to it as if real; flagged to the client as a gap
          // worth fixing (either wire real numbers or drop the fields).
        },
      };
    }

    case "captureLead": {
      const intent = (input.intent as string) ?? "general";
      const leadPayload = {
        name: input.name as string,
        email: input.email as string,
        phone: input.phone as string | undefined,
        timeline: input.timeline,
        budget: input.budget,
        financing: input.financing,
        neighborhoodInterest: input.neighborhoodInterest,
        notes: input.notes,
        source: "chatbot",
      };
      const tags = [`chatbot-${intent}`];

      try {
        if (isGhlConfigured()) {
          await sendToGhl({
            name: leadPayload.name,
            email: leadPayload.email,
            phone: leadPayload.phone,
            tags,
            customFields: { notes: String(leadPayload.notes ?? "") },
          });
        } else {
          await queueLead({ ...leadPayload, tags });
        }
      } catch (error) {
        await queueLead({ ...leadPayload, tags: [...tags, "chatbot-lead-error"], error: String(error) });
      }

      return { result: { confirmed: true } };
    }

    case "offerScheduling": {
      return {
        result: { confirmed: true, note: "Scheduling widget will open client-side." },
        clientAction: {
          type: "open_scheduling",
          prefill: { name: input.name as string | undefined, email: input.email as string | undefined },
        },
      };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` } };
  }
}
