import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

// Shared shell for dropdown-nav pages (Buyers, Sellers, ...) that don't have
// client-supplied content yet — keeps the nav item live and on-brand instead
// of 404ing, until content arrives one page at a time.
export function ComingSoonPage({
  eyebrow,
  heading,
  utmContent,
}: {
  eyebrow: string;
  heading: string;
  utmContent: string;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow={eyebrow} heading={heading} as="h1" />
      <div className="mt-10 max-w-xl border border-line p-8 sm:p-10">
        <p className="font-sans text-base text-body">
          This page is being written and will be live here shortly. In the meantime,{" "}
          {brand.broker.name} is happy to walk you through it directly.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={brand.phone.href}
            className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
          >
            Call {brand.phone.display}
          </a>
          <CalendlyButton
            utmContent={utmContent}
            className="inline-flex min-h-11 items-center justify-center border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
          >
            Book a 15-Minute Call
          </CalendlyButton>
        </div>
      </div>
    </section>
  );
}
