import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "How to Prepare Your Home For a Showing",
  description:
    "Five simple steps to stage your Key West home for a showing — exterior, lighting, clutter, climate, and ambiance.",
};

const steps = [
  {
    number: "01",
    title: "Exterior",
    body: "First impressions matter, and the buyer's first impression is made outside the home. Make sure trees and hedges are pruned so they're not blocking windows and natural light. Sweep paving stones, patios, decks, and stairs clear of leaves and debris, and make sure gates and doors open smoothly. A fresh coat of paint or newly stained wood can impress buyers — and even garner a higher price.",
  },
  {
    number: "02",
    title: "Interior Lighting",
    body: "Light sells homes! Your property should always be well lit for a showing. Open every window shade and blind to bring in as much natural light as possible, then turn on lamps to provide additional ambient lighting and enhance what's already coming through the windows.",
  },
  {
    number: "03",
    title: "Reduce Clutter",
    body: "Keep the space as uncluttered as possible so a buyer's eyes focus on the features of the property, not distractions — particularly in the kitchen and bathrooms. Clear countertops and sinks, and organize cupboards and cabinets to maximize the sense of space. Don't forget the linen closet!",
  },
  {
    number: "04",
    title: "Climate Control",
    body: "You want potential buyers to take their time while viewing your property — but if it's too hot inside, they'll want to get out quickly. Keep the air conditioning running at a cool 75 degrees, and in larger homes, set the temperature down well in advance so the house has time to reach a comfortable temperature.",
  },
  {
    number: "05",
    title: "Ambiance",
    body: "A “showing” is just that — staging a show. Like any staged environment, being well-lit and augmented with the right music is a recipe for success. Many luxury home specialists add accent background music — classical or jazz — to set the mood.",
  },
];

export default function ShowingGuidePage() {
  return (
    <>
      <section className="relative flex min-h-[42vh] items-end overflow-hidden sm:min-h-[52vh]">
        <Image
          src="/sell/showing-guide-exterior.jpg"
          alt="A beautifully staged Key West home exterior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <SectionHeading
            eyebrow="Staging Your Home"
            heading="How to Prepare Your Home For a Showing"
            as="h1"
            tone="white"
            shadow
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="max-w-[65ch]">
            <p className="font-display text-xl italic leading-snug text-ink">
              Did you know most buyers judge your home within eight seconds of walking
              through the front door? That's why it's so important to carefully prepare
              your home for a showing. Once you've decided to list it, follow these five
              simple but important steps for a successful showing.
            </p>

            <div className="mt-12 flex flex-col gap-12">
              {steps.map((step) => (
                <div key={step.number} className="grid gap-3 border-t border-line pt-8 sm:grid-cols-[auto_1fr] sm:gap-8">
                  <span className="font-display text-6xl leading-none text-gold sm:text-7xl">
                    {step.number}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl text-ink">{step.title}</h2>
                    <p className="mt-3 font-sans text-base leading-relaxed text-body">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 border-l-4 border-teal pl-6">
              <p className="font-sans text-base leading-relaxed text-body">
                These simple steps don&rsquo;t cost a lot of money, but they can add{" "}
                <strong className="text-ink">10% or more</strong> to a buyer&rsquo;s offer
                price. It&rsquo;s important to work with an experienced agent who knows how
                to stage your home to make a lasting impression.
              </p>
            </div>

            <p className="mt-12 font-display text-xl italic leading-snug text-ink">
              Prepare your home for a showing — and let it show like it means to sell.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden border border-line">
              <Image
                src="/sell/showing-guide-interior.jpg"
                alt="A well-lit, uncluttered interior staged for a showing"
                width={1024}
                height={1024}
                className="h-auto w-full object-cover"
              />
              <p className="p-4 font-sans text-xs text-muted">
                Well-lit, uncluttered, and ready for a buyer to imagine themselves at home.
              </p>
            </div>

            <div className="border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Ready to List?
              </p>
              <p className="mt-3 text-sm text-body">
                {brand.broker.name} will walk your property before the first showing and
                tell you exactly what's worth doing — and what isn't.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={brand.phone.href}
                  className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
                >
                  Call {brand.phone.display}
                </a>
                <CalendlyButton
                  utmContent="showing-guide-page"
                  className="inline-flex min-h-11 items-center justify-center bg-teal px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
                >
                  Book a 15-Minute Call
                </CalendlyButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
