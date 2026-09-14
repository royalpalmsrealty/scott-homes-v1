import { NextResponse } from "next/server";
import { VoiceDiagnosticSchema } from "@/lib/voiceDiagnostics";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    sameOrigin = origin.host === request.headers.get("host") && (origin.protocol === "https:" || (!process.env.VERCEL && origin.protocol === "http:"));
  } catch { /* Invalid origins are rejected. */ }
  if (!sameOrigin) return new NextResponse(null, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return new NextResponse(null, { status: 415 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`voice-health:${ip}`, 120, 600_000).allowed) return new NextResponse(null, { status: 429 });
  const text = await request.text();
  if (Buffer.byteLength(text) > 1024) return new NextResponse(null, { status: 413 });
  let parsed;
  try { parsed = VoiceDiagnosticSchema.safeParse(JSON.parse(text)); } catch { /* Reject invalid JSON. */ }
  if (!parsed?.success) return new NextResponse(null, { status: 400 });
  console.info("voice-health", JSON.stringify(parsed.data));
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
