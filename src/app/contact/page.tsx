import Image from "next/image";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { brand } from "@/lib/brand";

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
            founder: {
              "@type": "Person",
              name: brand.broker.name,
              jobTitle: brand.broker.title,
            },
          }),
        }}
      />

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
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

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="order-first flex flex-col gap-6 lg:order-last lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/brand/scott.jpg"
                  alt={brand.broker.name}
                  width={629}
                  height={1120}
                  className="h-16 w-16 shrink-0 object-cover"
                />
                <div>
                  <p className="font-display text-lg text-ink">{brand.broker.name}</p>
                  <p className="font-sans text-xs text-muted">{brand.broker.title}</p>
                </div>
              </div>
              <p className="mt-5 font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Direct
              </p>
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
                  className="inline-flex min-h-11 flex-1 items-center justify-center bg-ink px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
                >
                  Call Now
                </a>
                <a
                  href={brand.email.href}
                  className="inline-flex min-h-11 flex-1 items-center justify-center border border-ink px-4 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
                >
                  Email
                </a>
              </div>
            </div>

            <div className="border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Office
              </p>
              <address className="mt-3 font-sans text-sm not-italic text-body">
                {brand.address.line1}
                <br />
                {brand.address.city}, {brand.address.state} {brand.address.zip}
              </address>
              <p className="mt-4 font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Hours
              </p>
              <p className="mt-2 font-sans text-sm text-body">
                By appointment, 7 days a week
              </p>
            </div>

            <div className="aspect-[4/3] w-full overflow-hidden border border-line sm:aspect-video">
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
      </section>
    </>
  );
}
