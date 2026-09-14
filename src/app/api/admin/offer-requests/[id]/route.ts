import { NextResponse } from "next/server";
import { isAdminAuthed, isAdminPasswordConfigured } from "@/lib/adminAuth";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAdminPasswordConfigured() || !(await isAdminAuthed())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid request reference." }, { status: 400 });
  const { data, error } = await getSupabase().from("leads").select("id,payload,created_at").eq("id", id).eq("source", "website-offer-intake").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load request." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  return NextResponse.json({
    schemaVersion: 1, requestId: data.id, receivedAt: data.created_at,
    buyerRequest: data.payload.draft, buyerConfirmed: data.payload.buyerConfirmed === true,
    propertyVerified: data.payload.propertyVerified === true, property: data.payload.property ?? null,
    routing: data.payload.routing ?? { status: "awaiting_broker_choice", automation: null },
  }, { headers: { "Cache-Control": "private, no-store", "Content-Disposition": `attachment; filename="offer-request-${id}.json"` } });
}
