"use client";

// GA4/GTM isn't wired yet (no NEXT_PUBLIC_GA4_ID/GTM_ID configured — see
// .env.example and D1). This pushes to window.dataLayer if it exists and is
// a safe no-op otherwise, so every call site is already correct once GTM
// lands — nothing here needs to change.
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (!Array.isArray(dataLayer)) return;
  dataLayer.push({ event: name, ...params });
}

export function trackValuationCtaClick(location: string) {
  trackEvent("valuation_cta_click", { location });
}
