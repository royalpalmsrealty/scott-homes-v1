import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { CinematicVideoBand } from "@/components/media/CinematicVideoBand";
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
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        {/* Soft brand-color wash — same restrained blurred-orb device used on
            the contact page hero, the footer, and Meet Scott below. */}
        <span
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-[0.15] blur-[110px]"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full opacity-[0.15] blur-[100px]"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />

        <div className="relative mx-auto max-w-[1280px]">
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
            Keys, with a focus on Old Town, New Town, Truman Annex, Casa Marina, Midtown West,
            Midtown East, and the island&rsquo;s waterfront and transient-licensed inventory.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-3">
            {[
              { label: "Key West, FL", icon: <PinIcon />, tint: "teal" as const },
              { label: "Boutique Brokerage", icon: <StarIcon />, tint: "gold" as const },
              { label: "8 Neighborhoods Covered", icon: <MapIcon />, tint: "teal-deep" as const },
              { label: "Buyers · Sellers · Investors", icon: <PeopleIcon />, tint: "ink" as const },
            ].map((fact) => (
              <span
                key={fact.label}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-sans text-xs font-medium ${
                  fact.tint === "teal"
                    ? "border-teal/30 bg-teal/10 text-teal-deep"
                    : fact.tint === "gold"
                      ? "border-gold/30 bg-gold/10 text-gold-deep"
                      : fact.tint === "teal-deep"
                        ? "border-[var(--teal-deep)]/30 bg-[var(--teal-deep)]/10 text-[var(--teal-deep)]"
                        : "border-line bg-paper text-ink"
                }`}
              >
                {fact.icon}
                {fact.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CinematicVideoBand
        src="/video/about-pool.webm"
        eyebrow="The Key West Lifestyle"
        heading="What You're Really Buying"
      >
        <p className="text-on-video mt-5 max-w-xl font-sans text-base text-white/90 sm:text-lg">
          Beyond the square footage and the closing statement, a Key West property is an
          invitation to a different pace of life — mornings by the pool, evenings that
          don&rsquo;t rush. It&rsquo;s the part of the sale that never shows up on paper,
          but it&rsquo;s usually the reason our clients came looking in the first place.
        </p>
      </CinematicVideoBand>

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

      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <span
          className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full opacity-[0.12] blur-[120px]"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full opacity-[0.12] blur-[100px]"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />

        <div className="relative mx-auto max-w-[1280px]">
          <SectionHeading eyebrow="Your Broker" heading="Meet Scott Forman" as="h2" />
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
            <div className="mx-auto shrink-0 sm:mx-0">
              <span
                className="inline-block rounded-2xl p-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
                style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
              >
                <Image
                  src="/brand/scott.jpg"
                  alt={brand.broker.name}
                  width={629}
                  height={1120}
                  className="block h-80 w-auto rounded-[14px] border-4 border-white object-cover sm:h-96"
                />
              </span>
              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                {[
                  { label: "Since 2001", tint: "teal" as const },
                  { label: "Broker/Owner", tint: "gold" as const },
                  { label: "REALTOR®", tint: "ink" as const },
                ].map((badge) => (
                  <span
                    key={badge.label}
                    className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium ${
                      badge.tint === "teal"
                        ? "border-teal/30 bg-teal/10 text-teal-deep"
                        : badge.tint === "gold"
                          ? "border-gold/30 bg-gold/10 text-gold-deep"
                          : "border-line bg-paper text-ink"
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
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
                Today he&rsquo;s the owner and Principal Broker of {brand.brokerage}, and
                one of the foremost experts in luxury real estate in the Florida Keys —
                named Key West&rsquo;s Former Realtor of the Year. In 2014, he was chosen to
                take over Marquis Properties as the two top luxury boutique companies merged
                to form Royal Palms Realty, with the combined firms going on to record
                hundreds of millions of dollars in sales with just two luxury agents. He
                currently serves as MLS Chairman and Board Member of the Key West Association
                of REALTORS. His passion is providing personalized service and creating the
                best possible experience for every luxury buyer and seller he works with.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href={brand.phone.href}
                  className="flex items-center gap-2 font-sans text-sm font-medium text-teal-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/15">
                    <PhoneSmallIcon />
                  </span>
                  {brand.phone.display}
                </a>
                <a
                  href={brand.email.href}
                  className="flex items-center gap-2 font-sans text-sm font-medium text-teal-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/15">
                    <MailIcon />
                  </span>
                  {brand.email.display}
                </a>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Follow
                </p>
                <SocialLinks />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ background: "linear-gradient(135deg, var(--teal-deep) 0%, var(--ink) 100%)" }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                    <BadgeIcon />
                  </span>
                  <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold">
                    Affiliations &amp; Certifications
                  </p>
                  <p className="mt-2 font-sans text-sm text-white/85">
                    REALTOR&reg; &middot; Owner &middot; Principal Broker
                  </p>
                </div>
                <div
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ background: "linear-gradient(135deg, var(--teal-deep) 0%, var(--ink) 100%)" }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                    <HouseIcon />
                  </span>
                  <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold">
                    Services Provided
                  </p>
                  <p className="mt-2 font-sans text-sm text-white/85">
                    Luxury Real Estate Sales in Key West
                  </p>
                </div>
              </div>

              <div
                className="mt-4 rounded-2xl p-5 shadow-sm"
                style={{ background: "linear-gradient(135deg, var(--teal-deep) 0%, var(--ink) 100%)" }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                  <ShieldIcon />
                </span>
                <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold">
                  Licensing
                </p>
                <p className="mt-2 font-sans text-sm text-white/85">
                  Florida Real Estate License #: BK #3045796
                </p>
                {/* TODO-CLIENT-ASSET: only Scott's individual broker license (BK #3045796)
                    was confirmed — a separate brokerage entity license (typically a
                    "CQ" number in FL) hasn't been supplied yet. Confirm before removing this line. */}
                <p className="font-sans text-sm text-white/85">
                  {brand.brokerage} Brokerage License #: TODO-CLIENT-ASSET
                </p>
              </div>

              <CalendlyButton
                utmContent="about-scott-forman"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-7 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
              >
                <CalendarSmallIcon />
                Schedule a Call With Scott
              </CalendlyButton>
            </div>
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

function PhoneSmallIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-teal-deep">
      <path
        d="M6.6 10.8C8.1 13.8 10.2 15.9 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.5 21.4 2.6 13.5 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-teal-deep">
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 6l8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l2.6 1.5 3-.1 1.1 2.8 2.5 1.7-1 2.9 1 2.9-2.5 1.7-1.1 2.8-3-.1L12 21l-2.6-1.5-3 .1-1.1-2.8-2.5-1.7 1-2.9-1-2.9 2.5-1.7 1.1-2.8 3 .1L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11l8-7 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 19v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2Z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 19c1-3 3.3-4.6 5.7-4.6s4.7 1.6 5.7 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 14.8c2 .1 3.9 1.5 4.7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
