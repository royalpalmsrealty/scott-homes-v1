"use client";

import type { ReactNode } from "react";
import { calendlyUrl } from "@/lib/siteConfig";

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

export type CalendlyPrefill = { name?: string; email?: string };

function loadWidgetCss() {
  if (document.querySelector(`link[href="${WIDGET_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = WIDGET_CSS;
  document.head.appendChild(link);
}

let widgetLoadPromise: Promise<void> | null = null;

function loadWidgetScript(): Promise<void> {
  if (widgetLoadPromise) return widgetLoadPromise;

  // The popup overlay is unstyled (invisible, no positioning) without this —
  // Calendly's own embed snippet always ships the stylesheet alongside the script.
  loadWidgetCss();

  widgetLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly widget failed to load"));
    document.head.appendChild(script);
  });

  return widgetLoadPromise;
}

function buildUrl(prefill?: CalendlyPrefill, utmContent?: string) {
  const url = new URL(calendlyUrl);
  // Re-skins Calendly's own page/embed chrome to match the site palette
  // (teal accent, black text, white background) instead of Calendly's default blue.
  url.searchParams.set("primary_color", "28bcb8");
  url.searchParams.set("text_color", "000000");
  url.searchParams.set("background_color", "ffffff");
  if (prefill?.name) url.searchParams.set("name", prefill.name);
  if (prefill?.email) url.searchParams.set("email", prefill.email);
  if (utmContent) url.searchParams.set("utm_content", utmContent);
  return url.toString();
}

// Standalone so non-button callers (the chatbot's scheduling handoff) can
// open the same popup without needing a DOM click event.
export async function openCalendlyPopup(prefill?: CalendlyPrefill, utmContent?: string) {
  const url = buildUrl(prefill, utmContent);
  try {
    await loadWidgetScript();
    const calendly = (window as unknown as { Calendly?: { initPopupWidget: (opts: { url: string }) => void } }).Calendly;
    if (!calendly) throw new Error("Calendly script loaded but window.Calendly is missing");
    calendly.initPopupWidget({ url });
  } catch (error) {
    console.error("Calendly popup failed, opening in a new tab instead", error);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function CalendlyButton({
  prefill,
  utmContent,
  className,
  children,
}: {
  prefill?: CalendlyPrefill;
  /** Which page/flow triggered this, so Scott knows what the call is about. */
  utmContent?: string;
  className?: string;
  children: ReactNode;
}) {
  const url = buildUrl(prefill, utmContent);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    openCalendlyPopup(prefill, utmContent);
  }

  return (
    // Real href: with JS disabled, this is a plain link that opens Calendly
    // directly — the fallback the brief asked for, for free.
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
