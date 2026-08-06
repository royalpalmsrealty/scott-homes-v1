import type { ReactNode } from "react";
import { isAdminAuthed, isAdminPasswordConfigured } from "@/lib/adminAuth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await isAdminAuthed();

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {!isAdminPasswordConfigured() && (
        <div className="bg-gold px-4 py-2 text-center font-sans text-xs font-medium text-ink">
          ⚠ ADMIN_PASSWORD isn&rsquo;t set — this panel is currently open to anyone with the
          URL. Set it in .env.local before this goes anywhere real.
        </div>
      )}
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
