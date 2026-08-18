import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { neighborhoods } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "Key West Neighborhoods",
  description:
    "Explore Key West's neighborhoods — from Old Town's historic Conch houses to the private island of Sunset Key — with Royal Palms Realty.",
};

export default function NeighborhoodsPage() {
  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      {/* Same restrained blurred-orb wash used on the About and Contact pages. */}
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
        <SectionHeading
          eyebrow="Explore Key West"
          heading="Neighborhoods"
          as="h1"
        />
        <p className="mt-6 max-w-2xl font-sans text-base text-body">
          Every part of Key West has a different character — from Old Town&rsquo;s historic
          density to Sunset Key&rsquo;s private-island seclusion. Explore each neighborhood to
          see active listings, market data, and what makes it distinct.
        </p>
        <p className="mt-2 font-sans text-xs text-muted">
          Median price, days on market, and inventory figures are sample data — they&rsquo;ll
          connect to live numbers once the MLS layer is wired up.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {neighborhoods.map((neighborhood, i) => (
            <div key={neighborhood.slug}>
              <NeighborhoodCard
                neighborhood={neighborhood}
                aspectClassName="aspect-[4/5] sm:aspect-[4/3]"
                priority={i < 2}
              />
              <p className="mt-4 font-sans text-sm text-body">{neighborhood.overview[0]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-sans text-xs font-medium text-gold-deep">
                  <ClockIcon />
                  {neighborhood.daysOnMarket} Days on Market
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-sans text-xs font-medium text-teal-deep">
                  <HouseIcon />
                  {neighborhood.activeInventory} Homes Tracked
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11l8-7 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
