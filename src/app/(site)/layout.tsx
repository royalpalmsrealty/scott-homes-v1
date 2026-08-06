import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { ChatWidget } from "@/components/chat/ChatWidget";

// Public-site chrome — scoped to this route group so /admin (and any future
// internal tooling) doesn't inherit the marketing header/footer/chat widget.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-14 lg:pb-0">{children}</main>
      <Footer />
      <MobileStickyBar />
      <ChatWidget />
    </>
  );
}
