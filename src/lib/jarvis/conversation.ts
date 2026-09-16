import { z } from "zod";
import { neighborhoods } from "../neighborhoods.ts";

export const JarvisConversationContextSchema = z
  .object({
    criteria: z
      .object({
        neighborhood: z.string().trim().min(1).max(80),
        minBeds: z.number().int().min(0).max(20),
        minBaths: z.number().min(0).max(20),
        pool: z.boolean(),
      })
      .strict(),
    listingIds: z.array(z.string().regex(/^\d{5,10}$/)).max(25),
  })
  .strict();

export type JarvisConversationContext = z.infer<typeof JarvisConversationContextSchema>;

type ConversationMessage = { role: "user" | "assistant"; content: string };

export type JarvisConversationTurn = {
  criteria?: JarvisConversationContext["criteria"];
  referenceListingId?: string;
  clarification?: string;
};

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function numberFrom(text: string, noun: "bed" | "bath"): number | undefined {
  const match = text.match(
    new RegExp(`\\b(\\d+(?:\\.5)?|${Object.keys(NUMBER_WORDS).join("|")})\\s*(?:\\+|or more|plus)?\\s*${noun}(?:room)?s?\\b`, "i")
  );
  if (!match) return undefined;
  const numeric = Number(match[1]);
  return Number.isFinite(numeric) ? numeric : NUMBER_WORDS[match[1].toLowerCase()];
}

function standaloneNumber(text: string): number | undefined {
  const words = Object.keys(NUMBER_WORDS).join("|");
  const match = text.match(
    new RegExp(`^\\s*(?:maybe|about|approximately|at least|minimum)?\\s*(\\d+(?:\\.5)?|${words})\\s*(?:please)?[.!?]?\\s*$`, "i")
  );
  if (!match) return undefined;
  const numeric = Number(match[1]);
  return Number.isFinite(numeric) ? numeric : NUMBER_WORDS[match[1].toLowerCase()];
}

function promptedNumber(
  messages: ConversationMessage[],
  noun: "bedroom" | "bathroom"
): number | undefined {
  const otherNoun = noun === "bedroom" ? "bathroom" : "bedroom";
  for (let index = messages.length - 1; index > 0; index -= 1) {
    const answer = messages[index];
    const prompt = messages[index - 1];
    if (
      answer.role === "user" &&
      prompt.role === "assistant" &&
      new RegExp(`\\b${noun}s?\\b`, "i").test(prompt.content) &&
      !new RegExp(`\\b${otherNoun}s?\\b`, "i").test(prompt.content)
    ) {
      const value = standaloneNumber(answer.content);
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

function neighborhoodFrom(text: string): string | undefined {
  const lowered = text.toLowerCase();
  return neighborhoods.find((neighborhood) => lowered.includes(neighborhood.name.toLowerCase()))?.name;
}

function bedBathShorthandFrom(text: string): { minBeds: number; minBaths: number } | undefined {
  const separated = text.match(/\b([1-9])\s*(?:\/|-|x|by)\s*([1-9](?:\.5)?)\b/i);
  if (separated) return { minBeds: Number(separated[1]), minBaths: Number(separated[2]) };

  // Mobile dictation commonly turns “three, two” or “three-two” into “32”.
  // Only treat a compact two-digit value as bed/bath shorthand when the same
  // message clearly has home-search intent and names a supported neighborhood.
  const compact = text.match(/\b([1-9])([1-9])\b/);
  if (
    compact &&
    /\b(home|house|property|listing|looking|find|search)\b/i.test(text) &&
    neighborhoodFrom(text)
  ) {
    return { minBeds: Number(compact[1]), minBaths: Number(compact[2]) };
  }
  return undefined;
}

function ordinalFrom(text: string): number | undefined {
  const word = text.match(/\b(first|second|third|fourth|fifth|sixth|seventh)\b/i)?.[1]?.toLowerCase();
  if (word) return ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"].indexOf(word) + 1;
  const numeric = text.match(/\b(?:number|#)\s*([1-7])\b/i)?.[1];
  return numeric ? Number(numeric) : undefined;
}

function isSearchTurn(text: string, hasContext: boolean): boolean {
  return /\b(home|house|property|properties|listing|listings|bed|bedroom|bath|bathroom|pool|similar|first|second|third|find|looking|search)\b/i.test(
    text
  ) || (hasContext && /\b(other|another|instead|keep|show)\b/i.test(text));
}

export function deriveJarvisConversationTurn(
  messages: ConversationMessage[],
  context?: JarvisConversationContext
): JarvisConversationTurn | null {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content.trim();
  const promptedBeds = promptedNumber(messages, "bedroom");
  const promptedBaths = promptedNumber(messages, "bathroom");
  if (
    !lastUserMessage ||
    (!isSearchTurn(lastUserMessage, Boolean(context)) && promptedBeds === undefined && promptedBaths === undefined)
  ) {
    return null;
  }

  const allUserText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  const shorthand = bedBathShorthandFrom(lastUserMessage);
  const neighborhood = neighborhoodFrom(lastUserMessage) ?? context?.criteria.neighborhood ?? neighborhoodFrom(allUserText);
  const minBeds =
    numberFrom(lastUserMessage, "bed") ??
    promptedBeds ??
    shorthand?.minBeds ??
    context?.criteria.minBeds ??
    numberFrom(allUserText, "bed");
  const minBaths =
    numberFrom(lastUserMessage, "bath") ??
    promptedBaths ??
    shorthand?.minBaths ??
    context?.criteria.minBaths ??
    numberFrom(allUserText, "bath");
  const pool = /\b(?:with|need|must have|has|include|including|add)\s+(?:a\s+)?pool\b/i.test(lastUserMessage)
    ? true
    : context?.criteria.pool ?? false;

  if (!neighborhood || minBeds === undefined || minBaths === undefined) {
    const missing = [
      !neighborhood ? "the neighborhood" : "",
      minBeds === undefined ? "minimum bedrooms" : "",
      minBaths === undefined ? "minimum bathrooms" : "",
    ].filter(Boolean);
    return { clarification: `What should I use for ${missing.join(" and ")}?` };
  }

  if (context && minBeds < context.criteria.minBeds) {
    return {
      criteria: { neighborhood, minBeds, minBaths, pool },
      clarification: `You previously said at least ${context.criteria.minBeds} bedrooms. Should I relax that must-have to ${minBeds}?`,
    };
  }
  if (context && minBaths < context.criteria.minBaths) {
    return {
      criteria: { neighborhood, minBeds, minBaths, pool },
      clarification: `You previously said at least ${context.criteria.minBaths} bathrooms. Should I relax that must-have to ${minBaths}?`,
    };
  }

  const ordinal = ordinalFrom(lastUserMessage);
  if (ordinal && !context?.listingIds[ordinal - 1]) {
    return {
      criteria: { neighborhood, minBeds, minBaths, pool },
      clarification: `I can’t match “the ${ordinal === 1 ? "first" : `#${ordinal}`} one” to the current results. Which property did you mean?`,
    };
  }

  return {
    criteria: { neighborhood, minBeds, minBaths, pool },
    ...(ordinal ? { referenceListingId: context!.listingIds[ordinal - 1] } : {}),
  };
}
