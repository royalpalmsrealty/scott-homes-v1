import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { searchOfferProperty } from "@/lib/offerPropertyServer";

export const runtime = "nodejs";
export async function POST(request: Request) {
  let allowed = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    allowed = origin.host === request.headers.get("host") && (origin.protocol === "https:" || (!process.env.VERCEL && origin.protocol === "http:"));
  } catch { /* fail closed */ }
  if (!allowed) return NextResponse.json({ error: "Use the Royal Palms website." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`offer-property:${ip}`, 20, 10 * 60_000).allowed) return NextResponse.json({ error: "Please try again shortly." }, { status: 429 });
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 2048) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let reference: unknown;
  try { reference = JSON.parse(raw).reference; } catch { /* invalid body */ }
  if (typeof reference !== "string" || reference.trim().length < 3 || reference.length > 500) return NextResponse.json({ error: "Enter the full address or MLS number." }, { status: 400 });
  try {
    return NextResponse.json(await searchOfferProperty(reference.trim()), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ state: "unavailable", candidates: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
