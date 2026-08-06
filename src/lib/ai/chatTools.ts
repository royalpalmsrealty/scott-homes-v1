import type { Tool } from "./anthropic";
import { listingProvider } from "@/lib/listings/provider";
import { getNeighborhood, neighborhoods } from "@/lib/neighborhoods";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";
import { queueLead } from "@/lib/leadQueue";

const neighborhoodNames = neighborhoods.map((n) => n.name);

export const CHAT_TOOLS: Tool[] = [
  {
    name: "searchListings",
    description: "Search current Key West listings by neighborhood, price range, or bedroom count. Returns real listing data — never invent listings yourself.",
    input_schema: {
      type: "object",
      properties: {
        neighborhood: { type: "string", enum: neighborhoodNames },
        minPrice: { type: "number" },
        maxPrice: { type: "number" },
        beds: { type: "number" },
      },
    },
  },
  {
    name: "getListingDetail",
    description: "Get full details for one specific listing by its ID (get the ID from a prior searchListings result).",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
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
  | { type: "listings"; listings: unknown[] }
  | { type: "listing"; listing: unknown }
  | { type: "open_scheduling"; prefill: { name?: string; email?: string } };

export async function executeChatTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ result: unknown; clientAction?: ClientAction }> {
  switch (name) {
    case "searchListings": {
      const { listings } = await listingProvider.search({
        neighborhood: input.neighborhood as string | undefined,
        minPrice: input.minPrice as number | undefined,
        maxPrice: input.maxPrice as number | undefined,
        beds: input.beds as number | undefined,
      });
      const top = listings.slice(0, 6);
      return { result: top, clientAction: { type: "listings", listings: top } };
    }

    case "getListingDetail": {
      const listing = await listingProvider.getById(input.id as string);
      if (!listing) return { result: { error: "Listing not found" } };
      return { result: listing, clientAction: { type: "listing", listing } };
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
          medianPrice: neighborhood.medianPrice,
          daysOnMarket: neighborhood.daysOnMarket,
          activeInventory: neighborhood.activeInventory,
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
