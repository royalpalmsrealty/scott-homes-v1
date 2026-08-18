import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, COOKIE_SECURE } from "@/lib/adminAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const attrs = `Max-Age=0; HttpOnly; SameSite=Lax${COOKIE_SECURE ? "; Secure" : ""}`;
  // res.cookies.set() is keyed by cookie name — calling it twice for the same
  // name (to clear both the current Path=/ cookie and the old Path=/admin
  // one from before that fix) silently drops the first call. Appending raw
  // Set-Cookie headers is the only way to actually send both.
  res.headers.append("Set-Cookie", `${ADMIN_COOKIE_NAME}=; Path=/; ${attrs}`);
  res.headers.append("Set-Cookie", `${ADMIN_COOKIE_NAME}=; Path=/admin; ${attrs}`);
  return res;
}
