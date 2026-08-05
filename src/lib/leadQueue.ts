import { promises as fs } from "fs";
import path from "path";

// Interim fallback store for leads while GoHighLevel credentials aren't configured,
// and a safety net if a real GHL request fails — a lead lost to a failed request
// is unacceptable (build brief §11). Replace with a real queue table once Postgres
// is wired up (build brief §10).
const QUEUE_DIR = path.join(process.cwd(), ".data");
const QUEUE_FILE = path.join(QUEUE_DIR, "leads.jsonl");

export async function queueLead(payload: Record<string, unknown>) {
  await fs.mkdir(QUEUE_DIR, { recursive: true });
  const line = JSON.stringify({ ...payload, queuedAt: new Date().toISOString() });
  await fs.appendFile(QUEUE_FILE, `${line}\n`, "utf8");
}
