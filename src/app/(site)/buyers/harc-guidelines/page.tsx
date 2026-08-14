import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "HARC Guidelines",
  description:
    "Download the Historic Architectural Review Commission (HARC) guidelines for Key West property renovations and additions.",
};

export default function HarcGuidelinesPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="For Buyers" heading="HARC Guidelines" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        If your property sits within Key West&rsquo;s historic district, any exterior
        renovation, addition, or new construction has to meet the Historic Architectural
        Review Commission&rsquo;s design guidelines before you can pull a permit.
      </p>

      <div className="mt-10 flex max-w-xl items-center gap-5 border border-line p-6 sm:p-8">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal-deep">
          <PdfIcon />
        </span>
        <div className="flex-1">
          <p className="font-display text-lg text-ink">HARC Guidelines</p>
          <p className="mt-1 font-sans text-xs text-muted">PDF · 8.5 MB</p>
        </div>
        <a
          href="/buyers/harc-guidelines.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
        >
          Click Here to Download
        </a>
      </div>

      <div className="mt-10 border-l-4 border-teal bg-paper p-6 text-sm text-body">
        Not sure if your property falls inside the historic district, or what a HARC review
        means for your timeline? {brand.broker.name} can walk you through it before you buy.
      </div>

      <div className="mt-6">
        <CalendlyButton
          utmContent="harc-guidelines-page"
          className="inline-flex min-h-11 items-center justify-center border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
        >
          Book a 15-Minute Call
        </CalendlyButton>
      </div>
    </section>
  );
}

function PdfIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 17v-5h1.2a1.5 1.5 0 0 1 0 3H8.5M12.5 17v-5h1a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 13.5 17h-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
