import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { brand } from "@/lib/brand";

const facts = ["Broker/Owner", "Principal Broker", "Key West, FL"];

// Pulled from Scott's approved bio on the About page — reused here as
// highlights rather than a bare fact-chip row, to give the section real
// substance instead of empty space.
const highlights = [
  { value: "2001", label: "In Key West Real Estate Since" },
  { value: "2013", label: "Key West Realtor of the Year" },
  { value: "$52.7M", label: "Combined Firm Sales, 2013" },
];

export function MeetScottSection() {
  return (
    <section
      className="relative py-14 sm:py-24"
      style={{
        background:
          "linear-gradient(135deg, rgba(40,188,184,0.09) 0%, var(--paper) 42%, var(--paper) 58%, rgba(150,128,46,0.11) 100%)",
      }}
    >
      {/* Signature two-tone accent, echoing the ticker/footer treatment. */}
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        aria-hidden="true"
        style={{ background: "linear-gradient(90deg, var(--teal) 0%, var(--gold) 100%)" }}
      />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Your Agent" heading={`Meet ${brand.broker.name}`} as="h2" />

        <div className="mt-10 grid gap-12 lg:grid-cols-[380px_1fr] lg:items-center">
          <div className="relative mx-auto self-start sm:mx-0">
            {/* Offset card behind the photo for depth. */}
            <span
              className="absolute -bottom-4 -right-4 h-full w-full border border-line bg-white"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden">
              <Image
                src="/brand/scott.jpg"
                alt={brand.broker.name}
                width={629}
                height={1120}
                className="h-72 w-auto shrink-0 transition-transform duration-500 hover:scale-105 sm:h-96 lg:h-[420px] motion-reduce:transition-none motion-reduce:hover:scale-100"
              />
              <span className="absolute bottom-0 left-0 bg-ink px-3 py-1.5 font-sans text-[11px] font-medium uppercase tracking-wide text-white">
                {brand.broker.title.split(",")[0]}
              </span>
            </div>
          </div>

          <div>
            <p className="max-w-2xl font-sans text-base text-body sm:text-lg">
              {brand.broker.name} is {brand.brokerage}&rsquo;s {brand.broker.title.toLowerCase()},
              working directly with every buyer and seller he represents — from the first
              showing to the closing table.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-6 border-y border-teal/20 py-6">
              {highlights.map((highlight) => (
                <div key={highlight.label}>
                  <p className="font-display text-3xl text-gold sm:text-4xl">{highlight.value}</p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-wide text-muted">
                    {highlight.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="border border-teal/30 px-3 py-1.5 font-sans text-xs font-medium uppercase tracking-wide text-teal-deep"
                >
                  {fact}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={brand.phone.href}
                className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                Call {brand.broker.name.split(" ")[0]}
              </a>
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center justify-center border border-ink px-6 py-3 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                Learn More About Scott
              </Link>
            </div>

            <div className="mt-6">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Follow Scott
              </p>
              <SocialLinks className="mt-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
