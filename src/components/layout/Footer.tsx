import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { brand, primaryNav, rentalBookingUrl } from "@/lib/brand";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Fair Housing", href: "/fair-housing" },
  { label: "DMCA Notice", href: "/dmca" },
];

function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-start">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold">
        {children}
      </p>
      <span className="mt-2 h-px w-8 bg-gold/50" aria-hidden="true" />
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="var(--teal)"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="var(--teal)" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M6.6 10.8C8.1 13.8 10.2 15.9 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.5 21.4 2.6 13.5 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
        stroke="var(--teal)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="2.6" y="4.6" width="18.8" height="14.8" rx="1.5" stroke="var(--teal)" strokeWidth="1.5" />
      <path d="M3.5 5.5L12 13L20.5 5.5" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Signature two-tone accent, at the seam where the black Testimonials
          section ends — the same teal-into-gold used throughout the site. */}
      <span
        className="absolute inset-x-0 top-0 z-10 h-[3px]"
        aria-hidden="true"
        style={{ background: "linear-gradient(90deg, var(--teal) 0%, var(--gold) 100%)" }}
      />
      {/* A whisper of the logo's colors across the black ground, not a shape —
          same restrained treatment used on the Meet Scott section. */}
      <span
        className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-[0.08] blur-[100px]"
        aria-hidden="true"
        style={{ background: "var(--teal)" }}
      />
      <span
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full opacity-[0.08] blur-[100px]"
        aria-hidden="true"
        style={{ background: "var(--gold)" }}
      />

      {/* CTA strip — white, deliberately breaking from the black ground so it
          reads as its own moment rather than blending into the rest. */}
      <div className="relative bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-2xl text-ink sm:text-3xl">
              Ready to talk Key West real estate?
            </p>
            <p className="mt-1 font-sans text-sm text-muted">
              Every message goes straight to {brand.broker.name}.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={brand.phone.href}
              className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
            >
              Call {brand.phone.display}
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center border border-ink px-6 py-3 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-y-12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-x-0">
          <div className="flex flex-col items-start text-left">
            {/* Logo is a flat JPEG on a white ground (no knockout variant supplied yet) —
                framed in a white card so it reads cleanly on --ink. Swap for
                public/brand/logo-white.svg once available and drop the card. */}
            <div className="bg-white p-3">
              <Image
                src="/brand/logo.jpg"
                alt={brand.brokerage}
                width={207}
                height={154}
                className="h-16 w-auto"
              />
            </div>
            <p className="mt-4 font-display text-base italic text-white/90">
              Key West real estate, done quietly.
            </p>
            <div className="mt-5 flex flex-col items-start gap-2.5">
              <div className="flex items-start gap-2.5">
                <PinIcon />
                <address className="font-sans text-sm not-italic text-white">
                  {brand.address.line1}
                  <br />
                  {brand.address.city}, {brand.address.state} {brand.address.zip}
                </address>
              </div>
              <a
                href={brand.phone.href}
                className="flex items-center gap-2.5 font-sans text-sm text-white underline-offset-4 hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                <PhoneIcon />
                {brand.phone.display}
              </a>
              <a
                href={brand.email.href}
                className="flex items-center gap-2.5 font-sans text-sm text-white underline-offset-4 hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                <MailIcon />
                {brand.email.display}
              </a>
            </div>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-10">
            <ColumnHeading>Explore</ColumnHeading>
            <ul className="mt-4 flex flex-col gap-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-sm text-white underline-offset-4 hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={rentalBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm text-white underline-offset-4 hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
                >
                  Book a Vacation Rental &#8599;
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-10">
            <ColumnHeading>Legal</ColumnHeading>
            <ul className="mt-4 flex flex-col gap-3">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-sm text-white underline-offset-4 hover:text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-10">
            <ColumnHeading>{brand.broker.name}</ColumnHeading>
            <p className="mt-4 font-sans text-sm text-white">{brand.broker.title}</p>
            {/* TODO-CLIENT-ASSET: individual + brokerage license numbers */}
            <p className="mt-2 font-sans text-xs text-white/80">
              License #: TODO-CLIENT-ASSET
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-white/80">
            &copy; {new Date().getFullYear()} {brand.brokerage}. All rights reserved.
          </p>
          <p className="font-sans text-xs text-white/80">
            Equal Housing Opportunity &middot; REALTOR&reg;
          </p>
        </div>
      </div>
    </footer>
  );
}
