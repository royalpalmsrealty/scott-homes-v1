import { promises as fs } from "fs";
import path from "path";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Supabase-backed lead queue. Falls back to the local JSONL file if Supabase
// isn't configured yet (or if a Supabase write itself fails) — a lead lost
// to a missing table or a bad connection is unacceptable, same as before.
const QUEUE_DIR = path.join(process.cwd(), ".data");
const QUEUE_FILE = path.join(QUEUE_DIR, "leads.jsonl");

async function queueLocally(payload: Record<string, unknown>) {
  await fs.mkdir(QUEUE_DIR, { recursive: true });
  const line = JSON.stringify({ ...payload, queuedAt: new Date().toISOString() });
  await fs.appendFile(QUEUE_FILE, `${line}\n`, "utf8");
}

export async function queueLead(payload: Record<string, unknown>) {
  if (!isSupabaseConfigured()) {
    await queueLocally(payload);
    return;
  }

  const { tags, source, ghlError, ...rest } = payload;
  const { error } = await getSupabase()
    .from("leads")
    .insert({
      source: typeof source === "string" ? source : "unknown",
      tags: Array.isArray(tags) ? tags : [],
      payload: rest,
      ghl_error: typeof ghlError === "string" ? ghlError : null,
    });

  if (error) await queueLocally({ ...payload, supabaseError: error.message });
}
