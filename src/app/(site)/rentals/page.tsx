import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand, rentalBookingUrl } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Vacation Rentals",
  description: `Book a Key West vacation rental managed by ${brand.brokerage} — browse available properties and reserve directly online.`,
};

const highlights = [
  {
    title: "Licensed & Managed Locally",
    body: "Every rental is transient-licensed and managed by a team who actually lives here — not a call center.",
  },
  {
    title: "Real-Time Availability",
    body: "Booking runs through our secure reservation platform, so what you see is what's actually open.",
  },
  {
    title: "A Local Contact If You Need One",
    body: `Questions before or during your stay? ${brand.broker.name}'s office is a phone call away.`,
  },
];

export default function RentalsPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Stay In Key West" heading="Vacation Rentals" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        From Old Town cottages to waterfront escapes, browse our licensed vacation rentals
        and book directly — no middleman markup, no guesswork on availability.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <a
          href={rentalBookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center bg-ink px-8 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          Browse &amp; Book Rentals &#8599;
        </a>
        <a
          href={brand.phone.href}
          className="inline-flex min-h-11 items-center justify-center border border-ink px-8 py-3.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          Call {brand.phone.display}
        </a>
      </div>

      <div className="mt-16 grid gap-8 border-t border-line pt-12 sm:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title}>
            <p className="font-display text-lg text-ink">{item.title}</p>
            <p className="mt-2 font-sans text-sm text-body">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 border border-line p-6 sm:p-8">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
          Own a Property in Key West?
        </p>
        <p className="mt-3 max-w-2xl font-sans text-sm text-body">
          If you&rsquo;re considering putting your own home into a transient rental
          program, {brand.broker.name} can walk you through licensing, projected income,
          and management options.
        </p>
        <CalendlyButton
          utmContent="rentals-page"
          className="mt-4 inline-flex min-h-11 items-center justify-center bg-teal px-6 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Book a 15-Minute Call
        </CalendlyButton>
      </div>
    </section>
  );
}
