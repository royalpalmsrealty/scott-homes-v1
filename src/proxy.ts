import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/adminSession";

// Gates /admin/* BEFORE any page rendering starts — deliberately not done
// inside admin/layout.tsx. See project memory: a layout that conditionally
// skips {children} does NOT stop Next.js from still rendering/serializing
// that child page into the RSC payload — proxy (formerly "middleware", see
// Next.js 16's rename) is the only point that reliably runs first. Proxy
// defaults to the Node.js runtime as of Next.js 16, so there's no Edge
// restriction here, but this still only imports adminSession.ts (Web Crypto
// + btoa) rather than the Supabase-backed password check, which only ever
// runs in the login route — no reason to add a DB round-trip to every request.
const ADMIN_COOKIE_NAME = "rpr_admin_session";

// Every /admin/* response gets this — otherwise the browser's back/forward
// cache can replay a page that was rendered while authenticated, even after
// the session cookie has been cleared by /api/admin/logout.
function withNoStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}

export async function proxy(request: NextRequest) {
  const configured = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SESSION_SECRET
  );

  // Not configured yet — same intentional "open, but the layout shows a
  // warning banner" placeholder behavior as before.
  if (!configured) return withNoStore(NextResponse.next());

  if (request.nextUrl.pathname === "/admin/login") return withNoStore(NextResponse.next());

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token, process.env.SESSION_SECRET!);
  if (valid) return withNoStore(NextResponse.next());

  // Rewrite (not redirect) so the address bar keeps showing the page the
  // user actually asked for — logging in and reloading lands them there.
  return withNoStore(NextResponse.rewrite(new URL("/admin/login", request.url)));
}

export const config = {
  matcher: ["/admin/:path*"],
};
