import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Single call site for the Supabase client — server-side only, using the
// service role key (bypasses RLS). Every store (blog, leads, knowledge base,
// admin auth) goes through this instead of creating its own client.
export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase isn't configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)");
  }
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}
