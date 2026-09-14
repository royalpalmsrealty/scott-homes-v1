"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { brand, primaryNav } from "@/lib/brand";
import { trackValuationCtaClick } from "@/lib/analytics";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { AssistantButton } from "@/components/assistant/AssistantButton";

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openDropdown) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpenDropdown(null);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [openDropdown]);

  return (
    <header ref={header} className="sticky top-0 z-40 border-b border-line bg-white"
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenDropdown(null); }}
      onKeyDown={event => {
        if (event.key === "Escape" && openDropdown) {
          setOpenDropdown(null);
          header.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')?.focus();
        }
      }}>
      <div className="mx-auto flex min-h-16 max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:min-h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep">
          <Image src="/brand/logo.jpg" alt={brand.brokerage} width={207} height={154} priority className="h-12 w-auto sm:h-14" />
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/home-value" onClick={() => trackValuationCtaClick("header")}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-ink px-3 font-sans text-xs font-medium text-ink transition-colors hover:border-teal hover:bg-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep sm:px-4 sm:text-sm">
            What&rsquo;s My Home Worth?
          </Link>
          <AssistantButton className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-teal-deep px-3 text-xs font-medium text-white sm:px-4 sm:text-sm">Make an Offer</AssistantButton>
        </div>
      </div>

      {/* Every top-level destination stays visible at every screen width. */}
      <nav aria-label="Primary" className="border-t border-line px-2 sm:px-6 lg:px-8">
        <ul className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-1 py-1">
          {primaryNav.map(item => "children" in item ? (
            <li key={item.label} className="sm:relative"
              onPointerEnter={event => { if (event.pointerType === "mouse") setOpenDropdown(item.label); }}
              onPointerLeave={event => { if (event.pointerType === "mouse") setOpenDropdown(open => open === item.label ? null : open); }}>
              <button type="button" aria-haspopup="true" aria-expanded={openDropdown === item.label}
                onClick={() => setOpenDropdown(open => open === item.label ? null : item.label)}
                className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded px-2 font-sans text-xs font-medium text-body hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-deep sm:px-3 sm:text-sm">
                {item.label}<ChevronIcon open={openDropdown === item.label} />
              </button>
              {openDropdown === item.label && (
                <ul className="absolute inset-x-4 top-full z-10 border border-line bg-white py-2 shadow-lg sm:inset-x-auto sm:left-1/2 sm:w-52 sm:-translate-x-1/2">
                  {item.children.map(child => (
                    <li key={child.href}><Link href={child.href} onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-3 font-sans text-sm text-body hover:bg-paper hover:text-ink">{child.label}</Link></li>
                  ))}
                </ul>
              )}
            </li>
          ) : (
            <li key={item.href}><Link href={item.href} onClick={() => setOpenDropdown(null)}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded px-2 font-sans text-xs font-medium text-body hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-deep sm:px-3 sm:text-sm">{item.label}</Link></li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-center gap-5 border-t border-line px-4 py-1 text-xs text-teal-deep sm:hidden">
        <a href={brand.phone.href} className="inline-flex min-h-9 items-center">Call Scott</a>
        <CalendlyButton utmContent="mobile-header" className="inline-flex min-h-9 items-center">Book a Call</CalendlyButton>
      </div>
    </header>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
