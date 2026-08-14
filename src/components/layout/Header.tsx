"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { brand, primaryNav } from "@/lib/brand";
import { trackValuationCtaClick } from "@/lib/analytics";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Keyed by nav label rather than one boolean per dropdown — scales to any
  // number of dropdown nav items (Buyers, Sellers, and whatever comes next)
  // without adding a new pair of state variables each time.
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) setOpenMobileDropdown(null);
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          {/* TODO-CLIENT-ASSET: stacked lockup is compact at header height; swap in
              a horizontal lockup (public/brand/logo-horizontal.svg) once supplied. */}
          <Image
            src="/brand/logo.jpg"
            alt={brand.brokerage}
            width={207}
            height={154}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) =>
              "children" in item ? (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown((open) => (open === item.label ? null : open))}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openDropdown === item.label}
                    onClick={() => setOpenDropdown((open) => (open === item.label ? null : item.label))}
                    className="inline-flex items-center gap-1 px-3 py-2 font-sans text-sm font-medium text-body transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                  >
                    {item.label}
                    <ChevronIcon open={openDropdown === item.label} />
                  </button>
                  {openDropdown === item.label && (
                    <ul className="absolute left-0 top-full z-10 min-w-[220px] border border-line bg-white py-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2.5 font-sans text-sm text-body transition-colors hover:bg-paper hover:text-ink"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center px-3 py-2 font-sans text-sm font-medium text-body transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/home-value"
            onClick={() => trackValuationCtaClick("header")}
            className="inline-flex h-9 items-center rounded-full border border-ink px-4 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
          >
            What&rsquo;s My Home Worth?
          </Link>
        </div>

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center text-ink lg:hidden"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <MenuIcon open={drawerOpen} />
        </button>
      </div>

      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          className="fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col bg-white lg:hidden"
        >
          <nav aria-label="Primary" className="flex-1 overflow-y-auto px-6 py-8">
            <Link
              href="/home-value"
              onClick={() => {
                trackValuationCtaClick("mobile-drawer");
                setDrawerOpen(false);
              }}
              className="mb-8 flex min-h-11 items-center justify-center rounded-full border border-ink px-5 py-3 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
            >
              What&rsquo;s My Home Worth?
            </Link>
            <ul className="flex flex-col gap-6">
              {primaryNav.map((item) =>
                "children" in item ? (
                  <li key={item.label}>
                    <button
                      type="button"
                      aria-expanded={openMobileDropdown === item.label}
                      onClick={() =>
                        setOpenMobileDropdown((open) => (open === item.label ? null : item.label))
                      }
                      className="flex w-full items-center justify-between font-display text-2xl text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                    >
                      {item.label}
                      <ChevronIcon open={openMobileDropdown === item.label} />
                    </button>
                    {openMobileDropdown === item.label && (
                      <ul className="mt-4 flex flex-col gap-4 border-l-2 border-teal pl-4">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setDrawerOpen(false)}
                              className="font-sans text-base text-body hover:text-teal-deep"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className="font-display text-2xl text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
          <div className="border-t border-line px-6 py-6">
            <a
              href={brand.phone.href}
              className="block font-sans text-base font-medium text-teal-deep"
            >
              Call {brand.broker.name}: {brand.phone.display}
            </a>
            <CalendlyButton
              utmContent="mobile-drawer"
              className="mt-4 flex min-h-11 items-center justify-center rounded-full bg-teal px-5 py-3 font-sans text-sm font-medium text-ink"
            >
              Book a Call
            </CalendlyButton>
          </div>
        </div>
      )}
    </header>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
