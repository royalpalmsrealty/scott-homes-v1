import { cookies } from "next/headers";

// Deliberately minimal — a shared-password cookie, not real user accounts,
// roles, or a session store. This is NOT how the eventual CMS should
// authenticate Scott; it exists only so the blog admin panel is unable to
// be edited by literally anyone who finds the URL. See D2.
export const ADMIN_COOKIE_NAME = "rpr_admin_session";

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdminAuthed(): Promise<boolean> {
  // No password configured yet — access is intentionally left open so the
  // panel can be demoed/tested, but every admin page shows a loud warning.
  // Set ADMIN_PASSWORD before this goes anywhere real.
  if (!isAdminPasswordConfigured()) return true;

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === process.env.ADMIN_PASSWORD;
}
