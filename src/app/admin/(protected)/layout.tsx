import type { ReactNode } from "react";
import { isAdminPasswordConfigured } from "@/lib/adminAuth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { AdminLogo } from "@/components/admin/AdminLogo";

// force-dynamic so this always touches request state instead of being
// statically prerendered — see project memory on the static-generation trap
// (auth configured after a build without a rebuild would otherwise stay
// frozen at whatever state existed at build time).
export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const configured = isAdminPasswordConfigured();

  return (
    <div className="relative min-h-screen bg-paper">
      <span className="pointer-events-none fixed -left-40 top-0 h-[420px] w-[420px] rounded-full bg-teal opacity-[0.06] blur-[130px]" />
      <span className="pointer-events-none fixed -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-gold opacity-[0.07] blur-[130px]" />

      <div className="relative bg-[linear-gradient(135deg,var(--teal-deep)_0%,var(--ink)_100%)] shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <AdminLogo size={40} />
            <div>
              <p className="font-display text-sm font-semibold text-white">Royal Palms Realty</p>
              <p className="font-sans text-[11px] uppercase tracking-wide text-white/50">Content Admin</p>
            </div>
          </div>

          <AdminNavLinks />

          <AdminLogoutButton />
        </div>

        {!configured && (
          <div className="bg-gold px-4 py-2 text-center font-sans text-xs font-medium text-ink">
            ⚠ Supabase / SESSION_SECRET aren&rsquo;t fully configured — this panel is currently open
            to anyone with the URL. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SESSION_SECRET
            in .env.local before this goes anywhere real.
          </div>
        )}
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
