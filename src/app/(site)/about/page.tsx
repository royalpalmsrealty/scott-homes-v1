import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Royal Palms Realty is a boutique luxury real estate brokerage serving Key West, Florida — personalized, discreet, and led by a broker who knows the island.",
};

const values = [
  {
    title: "Boutique, Not Corporate",
    body: "Every client works directly with the broker, not a rotating cast of assistants. Fewer clients, more attention.",
  },
  {
    title: "Deep Local Knowledge",
    body: "From Old Town's conch houses to Casa Marina's beachfront estates, we know the island block by block — and what each address is really worth.",
  },
  {
    title: "Discretion & Follow-Through",
    body: "Luxury transactions require a light touch and a firm hand. We negotiate quietly and close what we start.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading eyebrow="About Us" heading="Royal Palms Realty" as="h1" />
        {/* TODO-CLIENT-ASSET: replace with client-approved brokerage story copy */}
        <p className="mt-6 max-w-2xl font-sans text-base text-body">
          {brand.brokerage} is a boutique luxury real estate brokerage based in Key West,
          Florida. We work with a small number of buyers and sellers at a time, by
          design — it&rsquo;s the only way to give this market the attention it
          deserves. Whether it&rsquo;s a Conch house in Old Town, a beachfront estate in
          Casa Marina, or an investment property with a transient license, our approach
          is the same: know the property, know the market, and handle the details
          quietly.
        </p>
        <p className="mt-4 max-w-2xl font-sans text-base text-body">
          We serve buyers, sellers, and investors across Key West and the surrounding Lower
          Keys, with a focus on Old Town, New Town, Truman Annex, Casa Marina, Midtown, and
          the island&rsquo;s waterfront and transient-licensed inventory.
        </p>
      </section>

      <section className="bg-paper py-14 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Approach" heading="What Working With Us Looks Like" as="h2" />
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="border-t border-gold pt-5">
                <h3 className="font-display text-xl text-ink">{value.title}</h3>
                <p className="mt-3 font-sans text-sm text-body">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading eyebrow="Your Broker" heading="Meet Scott Forman" as="h2" />
        <div className="mt-10 flex flex-col gap-10 sm:flex-row">
          <div className="relative shrink-0 self-start">
            {/* Offset card behind the photo for depth — a small, deliberate
                editorial touch rather than a plain flush portrait. */}
            <span
              className="absolute -bottom-4 -right-4 h-full w-full bg-paper"
              aria-hidden="true"
              style={{ border: "1px solid var(--line)" }}
            />
            <Image
              src="/brand/scott.jpg"
              alt={brand.broker.name}
              width={629}
              height={1120}
              className="relative h-72 w-auto sm:h-80"
            />
          </div>

          <div className="max-w-2xl">
            <p className="font-display text-2xl text-ink">{brand.broker.name}</p>
            <p className="mt-1 font-sans text-sm font-medium text-teal-deep">
              Florida Keys Luxury Real Estate Specialist
            </p>
            <p className="mt-0.5 font-sans text-sm text-muted">{brand.broker.title}</p>

            <p className="mt-5 font-sans text-base text-body">
              Scott was raised in the Hamptons and worked as a sound engineer and music
              producer at The Hit Factory in New York City, where he worked with music
              legends including Stevie Wonder and Miles Davis, before relocating to Key
              West and entering the real estate industry in 2001.
            </p>
            <p className="mt-4 font-sans text-base text-body">
              He is the owner of {brand.brokerage} and has become one of the foremost
              experts in luxury real estate in the Florida Keys, having been named Key
              West Realtor of the Year for 2013.
            </p>

            <h3 className="mt-8 font-display text-xl text-ink">
              Florida Keys Luxury Real Estate Specialist
            </h3>
            <p className="mt-3 font-sans text-base text-body">
              Scott Forman is a top producer in the Key West luxury market, as well as the
              owner and Principal Broker of {brand.brokerage}. With well over a decade of
              experience, Scott was named Key West Realtor of the Year in 2013. In 2014, he
              was chosen to take over Marquis Properties as the two top luxury boutique
              companies merged to form Royal Palms Realty — the combined firms recorded
              $52.7 million in sales in 2013 with only two luxury agents. Scott&rsquo;s
              passion is providing personalized service and creating the best possible
              experience for luxury buyers and sellers.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href={brand.phone.href}
                className="font-sans text-sm font-medium text-teal-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
              >
                {brand.phone.display}
              </a>
              <a
                href={brand.email.href}
                className="font-sans text-sm font-medium text-teal-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
              >
                {brand.email.display}
              </a>
            </div>

            <SocialLinks className="mt-4" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-line p-5">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  Affiliations &amp; Certifications
                </p>
                <p className="mt-2 font-sans text-sm text-body">
                  REALTOR&reg; &middot; Owner &middot; Principal Broker
                </p>
              </div>
              <div className="border border-line p-5">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  Services Provided
                </p>
                <p className="mt-2 font-sans text-sm text-body">
                  Luxury Real Estate Sales in Key West
                </p>
              </div>
            </div>

            <div className="mt-4 border border-line p-5">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Licensing
              </p>
              {/* TODO-CLIENT-ASSET: individual + brokerage license numbers */}
              <p className="mt-2 font-sans text-sm text-muted">
                Florida Real Estate License #: TODO-CLIENT-ASSET
              </p>
              <p className="font-sans text-sm text-muted">
                {brand.brokerage} Brokerage License #: TODO-CLIENT-ASSET
              </p>
            </div>

            <CalendlyButton
              utmContent="about-scott-forman"
              className="mt-6 inline-flex min-h-11 items-center justify-center bg-teal px-6 py-3 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
            >
              Schedule a Call With Scott
            </CalendlyButton>
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 sm:py-20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Thinking About Buying or Selling in Key West?
          </h2>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center bg-white px-8 py-3 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
