"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { brand, primaryNav } from "@/lib/brand";

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
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
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center px-3 py-2 font-sans text-sm font-medium text-body transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href={brand.phone.href}
            className="font-sans text-sm font-medium text-body transition-colors hover:text-teal-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
          >
            {brand.phone.display}
          </a>
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
          >
            Search Listings
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
            <ul className="flex flex-col gap-6">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="font-display text-2xl text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line px-6 py-6">
            <a
              href={brand.phone.href}
              className="block font-sans text-base font-medium text-teal-deep"
            >
              Call {brand.broker.name}: {brand.phone.display}
            </a>
          </div>
        </div>
      )}
    </header>
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
