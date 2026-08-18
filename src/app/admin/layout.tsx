import type { ReactNode } from "react";

// Deliberately minimal — just the shared metadata. The nav/banner/logout
// chrome lives in admin/(protected)/layout.tsx instead, so /admin/login can
// render its own full-bleed design without fighting a parent wrapper.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
