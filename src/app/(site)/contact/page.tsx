import Image from "next/image";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand, socialPlatforms } from "@/lib/brand";

// R11: connects the brand's confirmed social profiles to the schema — this
// is how Google links them to the business, at no runtime cost.
const sameAs = socialPlatforms.filter((p) => p.url).map((p) => p.url);

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${brand.broker.name} at ${brand.brokerage} — call, email, or send a message about buying, selling, or renting in Key West, FL.`,
};

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  `${brand.brokerage}, ${brand.address.full}`
)}&output=embed`;

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["RealEstateAgent", "LocalBusiness"],
            name: brand.brokerage,
            image: "/brand/logo.jpg",
            telephone: brand.phone.display,
            email: brand.email.display,
            address: {
              "@type": "PostalAddress",
              streetAddress: brand.address.line1,
              addressLocality: brand.address.city,
              addressRegion: brand.address.state,
              postalCode: brand.address.zip,
              addressCountry: "US",
            },
            areaServed: "Key West, FL",
            sameAs,
            founder: {
              "@type": "Person",
              name: brand.broker.name,
              jobTitle: brand.broker.title,
            },
          }),
        }}
      />

      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        {/* Soft brand-color wash — same restrained blurred-orb device used on
            the footer and Meet Scott section, so the hero isn't just bare white. */}
        <span
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-[0.15] blur-[110px]"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -right-16 top-32 h-72 w-72 rounded-full opacity-[0.15] blur-[100px]"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />

        <div className="relative mx-auto max-w-[1280px]">
          <SectionHeading
            eyebrow="Get In Touch"
            heading="Contact Royal Palms Realty"
            as="h1"
          />
          <p className="mt-6 max-w-2xl font-sans text-base text-body">
            Have a question about a listing, thinking about selling, or just want to talk
            through the Key West market? Reach out directly — every message goes straight to{" "}
            {brand.broker.name}.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {[
              { label: "Buying", dot: "var(--teal)" },
              { label: "Selling", dot: "var(--gold)" },
              { label: "Renting", dot: "var(--teal-deep)" },
              { label: "General Questions", dot: "var(--ink)" },
            ].map((topic) => (
              <span
                key={topic.label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-body"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: topic.dot }} aria-hidden="true" />
                {topic.label}
              </span>
            ))}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="order-first flex flex-col gap-6 lg:order-last lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-4">
                <span
                  className="rounded-full p-[3px]"
                  style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
                >
                  <Image
                    src="/brand/scott.jpg"
                    alt={brand.broker.name}
                    width={629}
                    height={1120}
                    className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover"
                  />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">{brand.broker.name}</p>
                  <p className="font-sans text-xs text-muted">{brand.broker.title}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/15 text-teal-deep">
                  <PhoneSmallIcon />
                </span>
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  Direct
                </p>
              </div>
              <a
                href={brand.phone.href}
                className="mt-3 block font-display text-2xl text-ink hover:text-teal-deep"
              >
                {brand.phone.display}
              </a>
              <a
                href={brand.email.href}
                className="mt-1 block font-sans text-sm text-body hover:text-teal-deep"
              >
                {brand.email.display}
              </a>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={brand.phone.href}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
                >
                  <PhoneSmallIcon />
                  Call Now
                </a>
                <a
                  href={brand.email.href}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-ink px-4 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
                >
                  <MailIcon />
                  Email
                </a>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 text-white shadow-sm sm:p-8"
              style={{ background: "linear-gradient(135deg, var(--teal-deep) 0%, var(--ink) 100%)" }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <CalendarIcon />
              </span>
              <p className="mt-4 font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold">
                Prefer to Talk It Through?
              </p>
              <p className="mt-3 font-sans text-sm text-white/85">
                Book a free 15-minute call — enough time to walk through a listing, talk
                through timing on a sale, or just get oriented in the Key West market. No
                pressure, no obligation.
              </p>
              <CalendlyButton
                utmContent="contact-page"
                className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal px-4 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                <CalendarIcon small />
                Book a 15-Minute Call
              </CalendlyButton>
            </div>

            <div className="rounded-2xl border border-line p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/15 text-teal-deep">
                  <PinIcon />
                </span>
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  Office
                </p>
              </div>
              <address className="mt-3 pl-8 font-sans text-sm not-italic text-body">
                {brand.address.line1}
                <br />
                {brand.address.city}, {brand.address.state} {brand.address.zip}
              </address>
              <div className="mt-5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                  <ClockIcon />
                </span>
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  Hours
                </p>
              </div>
              <p className="mt-2 pl-8 font-sans text-sm text-body">
                By appointment, 7 days a week
              </p>
            </div>

            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line shadow-sm sm:aspect-video">
              <iframe
                title={`Map showing the ${brand.brokerage} office location`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PhoneSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8C8.1 13.8 10.2 15.9 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.5 21.4 2.6 13.5 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6l8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ small }: { small?: boolean }) {
  const size = small ? 15 : 18;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
