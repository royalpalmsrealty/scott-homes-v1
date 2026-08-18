import { cookies } from "next/headers";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { verifySessionToken } from "./adminSession";

// The admin password itself lives in Supabase (app_config table, key
// "admin_password") — set/changed by running SQL in the Supabase dashboard,
// not via an env var. SESSION_SECRET only signs the session cookie; it never
// needs to change once set.
export const ADMIN_COOKIE_NAME = "rpr_admin_session";

// NODE_ENV is "production" for any production build, including a local
// `npm run start` served over plain http:// — that's not the same thing as
// "actually served over https". VERCEL is only ever set inside Vercel's own
// build/runtime (always https there), so it's the accurate signal for
// whether the Secure cookie attribute is safe to set.
export const COOKIE_SECURE = Boolean(process.env.VERCEL);

export function isAdminPasswordConfigured() {
  return isSupabaseConfigured() && Boolean(process.env.SESSION_SECRET);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error("[admin-login] rejected: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set in this environment");
    return false;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "admin_password")
    .maybeSingle();

  if (error) {
    console.error("[admin-login] rejected: Supabase query failed:", error.message);
    return false;
  }
  if (!data?.value) {
    console.error("[admin-login] rejected: no admin_password row found in app_config");
    return false;
  }
  const match = data.value === password;
  if (!match) {
    console.error(
      `[admin-login] rejected: password mismatch (db value is ${data.value.length} chars, submitted value is ${password.length} chars)`
    );
  }
  return match;
}

export async function isAdminAuthed(): Promise<boolean> {
  // No Supabase/session-secret configured yet — same intentional "open, but
  // the layout shows a loud warning banner" placeholder as before.
  if (!isAdminPasswordConfigured()) return true;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token, process.env.SESSION_SECRET!);
}
