import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, COOKIE_SECURE, isAdminPasswordConfigured, verifyAdminPassword } from "@/lib/adminAuth";
import { createSessionToken } from "@/lib/adminSession";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`admin-login:${ip}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const { password } = await request.json().catch(() => ({ password: "" }));

  if (!isAdminPasswordConfigured()) {
    console.error(
      `[admin-login] rejected: isAdminPasswordConfigured() is false (SUPABASE_URL=${Boolean(
        process.env.SUPABASE_URL
      )}, SUPABASE_SERVICE_ROLE_KEY=${Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}, SESSION_SECRET=${Boolean(
        process.env.SESSION_SECRET
      )})`
    );
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // The cookie is a signed session token, not the password itself — the
  // password is only ever checked once, here, against Supabase.
  const token = await createSessionToken(process.env.SESSION_SECRET!);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    // Path "/" (not "/admin") — admin API routes live under /api/blog/* and
    // /api/admin/*, neither of which starts with "/admin", so a cookie
    // scoped there would never actually reach them.
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours, matches the session token's own TTL
  });
  return res;
}
