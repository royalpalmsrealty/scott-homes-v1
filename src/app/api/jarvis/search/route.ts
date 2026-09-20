import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  JarvisConsumerSearchInputSchema,
  searchConsumerListings,
} from "@/lib/jarvis/consumerSearchServer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    sameOrigin =
      origin.host === request.headers.get("host") &&
      (origin.protocol === "https:" || (!process.env.VERCEL && origin.protocol === "http:"));
  } catch {
    // Fail closed.
  }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Use the Royal Palms website." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`jarvis-search:${ip}`, 30, 10 * 60_000).allowed) {
    return NextResponse.json({ error: "Please try again shortly." }, { status: 429 });
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 2_048) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const criteria = JarvisConsumerSearchInputSchema.safeParse(parsed);
  if (!criteria.success) {
    return NextResponse.json({ error: "Invalid search criteria." }, { status: 400 });
  }

  const result = await searchConsumerListings(criteria.data);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
