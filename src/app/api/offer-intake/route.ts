import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { IntakeSubmissionSchema } from "@/lib/offerIntake";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { readPropertySelection, resolveOfferProperty } from "@/lib/offerPropertyServer";

export const runtime = "nodejs";
const SOURCE = "website-offer-intake";

export async function POST(request: Request) {
  // The AI has no submission tool. Only the visitor's confirmed same-origin form
  // can call this endpoint. There is deliberately no public read/update route.
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    // Next may use an internal hostname in request.url behind a proxy. Host
    // reflects the visitor's destination and cannot be set by browser JS.
    sameOrigin = origin.host === request.headers.get("host") &&
      (origin.protocol === "https:" || (!process.env.VERCEL && origin.protocol === "http:"));
  } catch { /* Missing and opaque origins are rejected. */ }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Please submit from the Royal Palms website." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Invalid request format." }, { status: 415 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`offer-intake:${ip}`, 8, 10 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Please wait before sending another request." }, { status: 429 });
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > 16_384) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = IntakeSubmissionSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Review and confirm all required offer details." }, { status: 400 });
  // Saving must be durable and the broker review screen must have authentication.
  if (!isSupabaseConfigured() || !process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Online offer requests are not available yet. Please call Scott at 305-923-9884." }, { status: 503 });
  }
  const { draft, requestId, propertySelection } = parsed.data;
  const selected = propertySelection ? readPropertySelection(propertySelection, draft.propertyReference, process.env.SESSION_SECRET) : null;
  if (propertySelection && !selected) return NextResponse.json({ error: "Please match the property again before sending." }, { status: 400 });
  const fingerprint = createHash("sha256").update(JSON.stringify(selected ? { draft, listingKey: selected.listingKey, mlsId: selected.mlsId } : draft)).digest("hex");
  try {
    const db = getSupabase();
    const { data: existing, error: existingError } = await db.from("leads").select("payload").eq("id", requestId).eq("source", SOURCE).maybeSingle();
    if (existingError) throw new Error("Unable to verify request reference.");
    if (existing) {
      if (existing.payload?.fingerprint !== fingerprint) return NextResponse.json({ error: "This request reference was already used for different terms." }, { status: 409 });
      return NextResponse.json({ ok: true, requestId }, { headers: { "Cache-Control": "no-store" } });
    }
    const property = propertySelection ? await resolveOfferProperty(draft.propertyReference, propertySelection) : null;
    if (propertySelection && !property) return NextResponse.json({ error: "The selected MLS record could not be verified. Match the property again before sending." }, { status: 409 });
    const { error } = await db.from("leads").insert({
      id: requestId, source: SOURCE, tags: ["offer-request", "broker-review-required"],
      payload: { draft, fingerprint, buyerConfirmed: true, propertyVerified: Boolean(property), property, status: "awaiting_broker_review", routing: { status: "awaiting_broker_choice", automation: null } },
    });
    if (error?.code === "23505") {
      const { data, error: readError } = await db.from("leads").select("payload").eq("id", requestId).eq("source", SOURCE).maybeSingle();
      if (readError || data?.payload?.fingerprint !== fingerprint) {
        return NextResponse.json({ error: "This request reference was already used. Start a new request to send different terms." }, { status: 409 });
      }
    } else if (error) {
      // Do not log buyer data or fall back to Vercel's ephemeral filesystem.
      console.error("Offer intake storage failed", error.code);
      return NextResponse.json({ error: "Your request was not saved. Please try again or call Scott." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, requestId }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Your request was not saved. Please try again or call Scott." }, { status: 503 });
  }
}
