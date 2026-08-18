import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthed } from "@/lib/adminAuth";

export const metadata = { robots: { index: false, follow: false } };

// force-dynamic so this actually checks the request's cookie instead of
// getting statically prerendered once and frozen — see the same trap
// documented on admin/(protected)/layout.tsx.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Landing here directly while already authenticated (or right after a
  // fresh login, since the form reloads whatever URL is in the address bar)
  // needs somewhere real to go — otherwise it just shows the login form again.
  if (await isAdminAuthed()) {
    redirect("/admin/blog");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--teal-deep)_0%,var(--ink)_100%)] px-4">
      <span className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-teal opacity-[0.15] blur-[120px]" />
      <span className="pointer-events-none absolute -bottom-32 -right-24 h-[380px] w-[380px] rounded-full bg-gold opacity-[0.12] blur-[110px]" />
      <div className="relative z-10">
        <AdminLoginForm />
      </div>
    </div>
  );
}
