import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomeValueForm } from "@/components/home-value/HomeValueForm";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "What's My Home Worth?",
  description: `Get a personal, data-driven home valuation from ${brand.broker.name} at ${brand.brokerage} — based on real comparable sales in Key West, not an automated estimate.`,
};

const steps = [
  {
    number: "01",
    title: "Tell us about your property",
    body: "Share the address and a little about your timeline — takes under a minute.",
  },
  {
    number: "02",
    title: "Scott reviews the comps",
    body: `${brand.broker.name} personally pulls recent, truly comparable sales in your neighborhood — not an automated algorithm guessing from public records.`,
  },
  {
    number: "03",
    title: "You get a real answer",
    body: "A call or email with an honest range and the reasoning behind it, plus what (if anything) could move the number.",
  },
];

export default function HomeValuePage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Know Your Number" heading="What's My Home Worth?" as="h1" />
      <p className="mt-6 max-w-2xl font-sans text-base text-body">
        Key West&rsquo;s market moves fast, and online estimators are usually wrong in this
        town — they can&rsquo;t account for a transient license, a dock, or which side of
        Flagler you&rsquo;re on. Tell us about your property and {brand.broker.name} will get
        back to you with a real, considered number.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <HomeValueForm />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line p-6 sm:p-8">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
              How It Works
            </p>
            <ol className="mt-5 flex flex-col gap-5">
              {steps.map((step) => (
                <li key={step.number} className="flex gap-4">
                  <span className="font-display text-2xl text-gold">{step.number}</span>
                  <div>
                    <p className="font-sans text-sm font-medium text-ink">{step.title}</p>
                    <p className="mt-1 font-sans text-sm text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-line p-6 sm:p-8">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
              No Obligation
            </p>
            <p className="mt-3 font-sans text-sm text-body">
              Whether you&rsquo;re selling next month or just curious what your place is
              worth today, there&rsquo;s no pressure and no cost. Prefer to talk it through
              instead? Call {brand.broker.name} directly at{" "}
              <a href={brand.phone.href} className="font-medium text-teal-deep hover:underline">
                {brand.phone.display}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
