import { callOpenAI, isOpenAIConfigured } from "./openai";
import { extractJson } from "./anthropic";
import { AiSearchFiltersSchema, emptyFilters, type AiSearchFilters } from "@/lib/schemas/aiSearchFilters";
import { neighborhoods } from "@/lib/neighborhoods";

const neighborhoodNames = neighborhoods.map((n) => n.name).join(", ");

const SYSTEM_PROMPT = `You turn a home buyer's natural-language search into a strict JSON filter object for a Key West, Florida real estate site.

Valid neighborhood names (use exactly one of these or null): ${neighborhoodNames}

Return ONLY a JSON object with exactly these keys, no prose, no markdown fences:
{
  "neighborhood": string or null,
  "minPrice": number or null,
  "maxPrice": number or null,
  "minBeds": number or null
}

Rules:
- "under $2M" -> maxPrice: 2000000. "over $1M" -> minPrice: 1000000.
- "3 bed" / "3+ bedrooms" -> minBeds: 3.
- Only set neighborhood if the query clearly names one from the list above.
- If a field isn't mentioned, use null. Never guess a value that wasn't implied.`;

export async function parseSearchQuery(
  query: string
): Promise<{ filters: AiSearchFilters; usedFallback: boolean }> {
  if (!isOpenAIConfigured()) {
    return { filters: emptyFilters, usedFallback: true };
  }

  try {
    const text = await callOpenAI({
      system: SYSTEM_PROMPT,
      prompt: query,
      maxOutputTokens: 300,
    });
    const parsed = AiSearchFiltersSchema.parse(extractJson(text));
    return { filters: parsed, usedFallback: false };
  } catch (error) {
    console.error("AI search parse failed, falling back to unfiltered search", error);
    return { filters: emptyFilters, usedFallback: true };
  }
}
