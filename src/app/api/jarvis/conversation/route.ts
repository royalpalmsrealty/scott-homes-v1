import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  deriveJarvisConversationTurn,
  JarvisConversationContextSchema,
} from "@/lib/jarvis/conversation";
import { searchConsumerListings } from "@/lib/jarvis/consumerSearchServer";

export const runtime = "nodejs";

const MessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(4_000),
  })
  .strict();

const RequestSchema = z
  .object({
    messages: z.array(MessageSchema).min(1).max(40),
    context: JarvisConversationContextSchema.optional(),
  })
  .strict();

function requestIsSameOrigin(request: Request): boolean {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return (
      origin.host === request.headers.get("host") &&
      (origin.protocol === "https:" || (!process.env.VERCEL && origin.protocol === "http:"))
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Use the Royal Palms website." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`jarvis-conversation:${ip}`, 30, 10 * 60_000).allowed) {
    return NextResponse.json({ error: "Please try again shortly." }, { status: 429 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw) > 32_000) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let unparsed: unknown;
  try {
    unparsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(unparsed);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
  }

  const turn = deriveJarvisConversationTurn(parsed.data.messages, parsed.data.context);
  if (!turn) {
    return NextResponse.json({
      reply: "Tell me the neighborhood and minimum bedrooms and bathrooms you want.",
      context: parsed.data.context ?? null,
      results: null,
    });
  }

  if (turn.clarification) {
    return NextResponse.json({
      reply: turn.clarification,
      context: parsed.data.context ?? null,
      results: null,
    });
  }

  if (!turn.criteria) {
    return NextResponse.json({
      reply: "Tell me the neighborhood and minimum bedrooms and bathrooms you want.",
      context: parsed.data.context ?? null,
      results: null,
    });
  }

  const result = await searchConsumerListings({ ...turn.criteria, limit: 7 });
  const context = { criteria: turn.criteria, listingIds: result.listingIds };

  if (result.state === "ready") {
    const reference = turn.referenceListingId
      ? ` I kept MLS #${turn.referenceListingId} as the reference property.`
      : "";
    const poolDescription = turn.criteria.pool ? " with a pool" : "";
    return NextResponse.json(
      {
        reply: `I found ${result.count} current IDX ${result.count === 1 ? "listing" : "listings"} in ${turn.criteria.neighborhood} with at least ${turn.criteria.minBeds} bedrooms and ${turn.criteria.minBaths} bathrooms${poolDescription}.${reference}`,
        context,
        results: {
          count: result.count,
          url: result.idxUrl,
          listingIds: result.listingIds,
          criteria: turn.criteria,
          ...(turn.referenceListingId ? { referenceListingId: turn.referenceListingId } : {}),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (result.state === "empty") {
    return NextResponse.json(
      {
        reply: `I didn’t find any current IDX listings matching those requirements in ${turn.criteria.neighborhood}. I have not relaxed any must-haves.`,
        context,
        results: null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      reply:
        result.state === "not_connected"
          ? "The JARVIS property-search connection is not configured on this preview yet."
          : "The live property search is temporarily unavailable. Please try again shortly.",
      context: parsed.data.context ?? context,
      results: null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
