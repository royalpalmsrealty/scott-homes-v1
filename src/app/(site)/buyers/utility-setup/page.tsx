import type { Metadata } from "next";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";
import { utilityProviders, utilityStandingNote } from "@/lib/utilityProviders";

export const metadata: Metadata = {
  title: "Setting Up Utilities After a Key West Move",
  description:
    "Official links and requirements for setting up electricity, water, internet, and garbage service after your Key West move or closing.",
};

// The Garbage & Recycling section isn't part of this revision's scope — left
// exactly as it was, just folded into the same numbered layout as 1–3.
const GARBAGE_SECTION = {
  number: "4",
  name: "Residential Garbage & Recycling",
  linkLabel: "City of Key West garbage collection info",
  linkHref: "https://www.cityofkeywest-fl.gov/376/Garbage-Collection",
  notes: [
    "For homes within the City of Key West, garbage collection is included in the property's annual tax assessment — you generally don't need to open a separate billing account.",
    "Waste Management provides one garbage cart per household.",
    "For a missing/replacement cart, missed collection, or a bulk pickup, call Waste Management at 305-296-8297.",
  ],
};

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline-block shrink-0">
      <path
        d="M7 17L17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UtilitySetupPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col items-start gap-2">
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold-deep">
          For Buyers
        </span>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          Setting Up Utilities After a Key West Move or Closing
        </h1>
        <span className="mt-4 h-px w-16 bg-gold" aria-hidden="true" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="max-w-[65ch] font-sans text-base leading-relaxed text-body">
          <p>
            Each utility below is set up directly with the provider, using their own official
            application — not through our office. The links, requirements, and phone numbers here
            come straight from each provider&rsquo;s current instructions.
          </p>
          <p className="mt-4 rounded-lg bg-paper px-4 py-3 text-sm text-muted">{utilityStandingNote}</p>

          {utilityProviders.map((provider) => (
            <div key={provider.number} className="mt-14 border-t border-line pt-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] font-display text-sm font-semibold text-ink">
                    {provider.number}
                  </span>
                  <h2 className="font-display text-2xl text-ink">{provider.name}</h2>
                </div>
                <p className="font-sans text-xs text-muted">Last verified: {provider.lastVerified}</p>
              </div>

              <div className="mt-6 border border-line p-6 sm:p-8">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  How to Set Up Service
                </p>
                <ol className="mt-4 flex flex-col gap-3 text-sm">
                  {provider.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 font-display text-sm text-teal-deep">{i + 1}.</span>
                      {/* Steps are hand-authored HTML (links to official pages), not
                          user input — safe to render directly. */}
                      {/* eslint-disable-next-line react/no-danger */}
                      <span
                        className="[&_a]:font-medium [&_a]:text-teal-deep [&_a]:underline [&_a]:hover:no-underline"
                        dangerouslySetInnerHTML={{ __html: step }}
                      />
                    </li>
                  ))}
                </ol>
              </div>

              {provider.note && (
                <p className="mt-4 font-sans text-xs text-muted">{provider.note}</p>
              )}

              <div className="mt-5 flex flex-col gap-1.5 text-sm">
                {provider.contact.map((item) => (
                  <p key={item.label} className="text-muted">
                    <span className="text-body">{item.label}:</span>{" "}
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-teal-deep hover:underline"
                      >
                        {item.value}
                        <ExternalLinkIcon />
                      </a>
                    ) : (
                      <span className="text-ink">{item.value}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Section 4 — Garbage & Recycling, unchanged from before */}
          <div className="mt-14 border-t border-line pt-10">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] font-display text-sm font-semibold text-ink">
                {GARBAGE_SECTION.number}
              </span>
              <h2 className="font-display text-2xl text-ink">{GARBAGE_SECTION.name}</h2>
            </div>

            <a
              href={GARBAGE_SECTION.linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
            >
              Go to {GARBAGE_SECTION.linkLabel} &rarr;
            </a>

            <ul className="mt-5 flex flex-col gap-2 text-sm text-muted">
              {GARBAGE_SECTION.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact card */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line p-6 sm:p-8">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
              Questions About Any of This?
            </p>
            <p className="mt-3 font-sans text-sm text-body">
              These are all handled directly between you and each provider — but if anything's
              unclear, reach out and we're happy to help point you in the right direction.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={brand.phone.href}
                className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
              >
                Call {brand.phone.display}
              </a>
              <CalendlyButton
                utmContent="utility-setup-page"
                className="inline-flex min-h-11 items-center justify-center bg-teal px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                Book a 15-Minute Call
              </CalendlyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
