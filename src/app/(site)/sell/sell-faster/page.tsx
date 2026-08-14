import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "List and Sell Your Luxury Key West Home Faster",
  description:
    "How to list and sell your luxury Key West home faster — pricing strategy, market context, and the marketing tools that bring buyers to the table.",
};

const marketingTools = [
  "Professional HDR Photography",
  "360×180 Interactive Virtual Tours",
  "Open House",
  "MLS",
  "REALTOR® Caravan",
  "Homes and Land Magazine Features",
  "Facebook and Social Media Advertising",
  "Direct Postcard Marketing with Jumbo-Size Panorama Postcards",
  "Website Syndication to 50+ of the World's Highest-Trafficked Real Estate Sites",
];

export default function SellFasterPage() {
  return (
    <>
      {/* Banner */}
      <section className="relative flex min-h-[42vh] items-end overflow-hidden sm:min-h-[52vh]">
        <Image
          src="/images/hero-poster.jpg"
          alt="Luxury Key West home"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <SectionHeading
            eyebrow="For Sellers"
            heading="List and Sell Your Luxury Key West Home Faster"
            as="h1"
            tone="white"
            shadow
          />
          <p className="text-on-video mt-4 max-w-2xl font-sans text-base text-white/90 sm:text-lg">
            How to &ldquo;List and Sell Your Luxury Key West Home Faster.&rdquo;
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          {/* Article */}
          <div className="max-w-[65ch] font-sans text-base leading-relaxed text-body [&>p+p]:mt-5">
            <p className="font-display text-xl italic leading-snug text-ink">
              How can you list and sell your luxury Key West home faster? Understanding
              market context and having a strong marketing presence are the keys to success
              when it comes to selling your Key West home quickly and effectively.
            </p>

            <p className="mt-6">
              Seller strategies have to be fluid with the market, so it&rsquo;s important to
              understand the context of the market at any given time. Most sellers who get
              stuck with long marketing times tend to be pricing based on influences outside
              the market itself — personal agendas, emotional attachments to a property, or
              calculating what they spent and what improvements cost. These mistakes can be
              costly in the final contract price, because they slow down marketing time.
            </p>

            <p>
              The longer you market a property, the less you are likely to net, because the
              listing becomes stale. People often assume the market has decided the property
              is worth passing over, simply based on the number of days it&rsquo;s been
              sitting. The assumption is that there must be something wrong with it, or that
              an unrealistic seller has overpriced it.
            </p>

            <p>
              When pricing a home, you should look at the current listing-to-selling price
              ratio, use a fair and realistic current market value, and adjust the list price
              accordingly. A clear, accurate assessment of value and a strategic list price
              bring the highest net yield in a sale — because those same factors bring the
              most attention, and therefore the most competition, to a property.
            </p>

            <p>
              If you&rsquo;re working with a REALTOR® who uses internet syndication, your
              property is most likely showing up in front of hundreds, if not thousands, of
              potential buyers around the world. If the property isn&rsquo;t getting
              activity, it&rsquo;s almost certainly a factor of pricing. Many sellers
              don&rsquo;t want to hear that, but it&rsquo;s the truth.
            </p>

            <p>
              One of the tools I provide for my sellers is a bi-weekly Marketing Report —
              live market data, including new listings, price reductions, and recent sales,
              so you can follow along as your property moves through the market.
            </p>

            <div className="mt-10 border-l-4 border-gold pl-6">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Key Marketing Tools
              </p>
              <p className="mt-2 text-sm text-body">
                In addition to the Marketing Report, we use specialized tools built
                specifically for selling Key West properties.
              </p>
            </div>

            <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {marketingTools.map((tool) => (
                <li key={tool} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <span className="text-sm text-body">{tool}</span>
                </li>
              ))}
            </ul>

            {/* Point2 syndication — one of the marketing tools above, shown as a
                supporting visual rather than a raw dropped-in image. */}
            <div className="mt-8 flex flex-col gap-4 border border-line p-6 sm:flex-row sm:items-center sm:p-8">
              <Image
                src="/sell/point2-syndication.png"
                alt="Point2 real estate syndication network"
                width={442}
                height={324}
                className="h-auto w-full max-w-[180px] shrink-0 object-contain sm:max-w-[160px]"
              />
              <div>
                <p className="font-display text-lg text-ink">Point2 Syndication</p>
                <p className="mt-1 text-sm text-muted">
                  Your listing doesn&rsquo;t just sit on one site — it syndicates out to the
                  Point2 network and dozens of other high-traffic real estate portals, putting
                  it in front of buyers who never would have found it otherwise.
                </p>
              </div>
            </div>

            <p className="mt-10 font-display text-xl italic leading-snug text-ink">
              Let me move you from FOR SALE to SOLD as quickly as possible, with the greatest
              net figure the market will allow.
            </p>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Free Listing Presentation
              </p>
              <p className="mt-3 text-sm text-body">
                Call today and let {brand.broker.name} show you what we can do — we&rsquo;ll
                custom-design a marketing platform for your home based on its unique
                features.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={brand.phone.href}
                  className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
                >
                  Call {brand.phone.display}
                </a>
                <CalendlyButton
                  utmContent="sell-faster-page"
                  className="inline-flex min-h-11 items-center justify-center bg-teal px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
                >
                  Book a 15-Minute Call
                </CalendlyButton>
              </div>
            </div>

            <div className="border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Not Ready to Sell Yet?
              </p>
              <p className="mt-3 text-sm text-body">
                Track your home&rsquo;s value as the market moves — request a free valuation
                any time and get a real, considered number, not a guess.
              </p>
              <Link
                href="/home-value"
                className="mt-4 inline-flex min-h-11 items-center justify-center border border-ink px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
              >
                Get My Home Value
              </Link>
            </div>

            <div className="flex items-center gap-4 border border-line p-6 sm:p-8">
              <Image
                src="/sell/nar-logo-gray.png"
                alt="National Association of REALTORS®"
                width={220}
                height={67}
                className="h-auto w-24 shrink-0 object-contain"
              />
              <p className="text-xs text-muted">
                {brand.broker.name} is a proud REALTOR®, held to the NAR Code of Ethics in
                every transaction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
