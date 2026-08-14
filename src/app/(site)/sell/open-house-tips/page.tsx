import type { Metadata } from "next";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "5 Reasons You Still Need to Have an Open House",
  description:
    "Is the open house outdated? Five reasons it still belongs in your Key West home-selling strategy.",
};

const reasons = [
  {
    number: "01",
    title: "It doesn't cost a dime (figuratively speaking).",
    body: [
      "Assuming you've listed your home with a local agency, the real cost of throwing an open house hovers right around zilch. Sure, your agent may choose to shell out a few bucks to promote the event in the local classifieds, but that's par for the course. Even with nothing more than a few signs and good weather on the weekend, you'll get bodies through the door.",
      "Sure, some will be time wasters or nosy neighbors, but when you're selling a house it's a numbers game — and it can't hurt to improve your chances.",
    ],
  },
  {
    number: "02",
    title: "You get the chance to monopolize your agent for a day.",
    body: [
      "Real estate agents are busy and work with multiple sellers at the same time. Hosting an open house and insisting the agent stay gives you a great opportunity to spend several hours with them, asking questions and clarifying their sales strategy. There's no better way to make sure they're focused on your home — not someone else's.",
    ],
  },
  {
    number: "03",
    title: "Buyers who visit open houses generally visit more than one.",
    body: [
      "A lot of open house shoppers spend the entire day visiting different showings. If your place has something special to offer that other listings in the neighborhood don't, this is your chance to show it off.",
      "With prospective buyers in “shop and compare” mode, you're more likely to catch someone's eye with how your property differs — especially if they've already been through several average homes that same afternoon.",
    ],
  },
  {
    number: "04",
    title: "Don't be a pessimist. The glass is half-full, I tell you!",
    body: [
      "I once read this on an anti-open-house blog: “Surveys by the National Association of REALTORS® show that only 3 to 7 percent of homes are sold by open houses.” My first thought was: 3 to 7 percent — not too shabby for half a day's work.",
      "The bottom line is there's no tried-and-true method for selling your home quickly. There's always an element of luck that the right buyer appears at just the right time. If selling your home is a little like winning the lottery, why not play every ticket you can?",
    ],
    pullQuote:
      "“Surveys show only 3 to 7 percent of homes sell through an open house.” Not bad for a half day's work.",
  },
  {
    number: "05",
    title: "He said, she said.",
    body: [
      "A primary complaint about open houses is that they attract a lot of browsers and not a lot of serious buyers. But the more eyes rolling through your property, the more social networks you tap into.",
      "Maybe your neighbor isn't interested in buying your place — but now that they've had a chance to see the renovations you made last summer, they just might recommend your house to someone they know who's in the market. You may not make the sale the same day as your open house, but word of mouth is a powerful tool once it's moving.",
    ],
  },
];

export default function OpenHouseTipsPage() {
  return (
    <>
      {/* Text-only hero — no photography for this piece, so the drama comes
          from type and the same ink/teal/gold treatment used on the footer. */}
      <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
        <span
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-[0.12] blur-[110px]"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full opacity-[0.12] blur-[110px]"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />
        <div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-6">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
            For Sellers
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            5 Reasons You Still Need
            <br className="hidden sm:block" /> to Have an Open House
          </h1>
          <span className="mx-auto mt-6 block h-px w-16 bg-gold" aria-hidden="true" />
          <p className="mx-auto mt-8 max-w-2xl font-display text-xl italic leading-snug text-white/90 sm:text-2xl">
            It used to be a no-brainer that part of selling a home was hosting an open
            house — balloons, free coffee, and hopefully, hordes of potential buyers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-[65ch] font-sans text-base leading-relaxed text-body">
          <p>
            These days the open house is under attack. Opponents contend it&rsquo;s
            outdated, unnecessary, and nothing more than an excuse for your agent to pass
            out business cards to future clients — an invitation for nosy neighbors to see
            how you live.
          </p>
          <p className="mt-5">
            And sure, the case against open houses makes some valid points. Relying solely
            on one to drive the sale of your house would be wishful thinking — today, the
            core of marketing any home is a robust online strategy.
          </p>
          <p className="mt-5">
            But let&rsquo;s not throw out the baby with the bathwater. While an open house
            may not produce the results it once did, here are five reasons it still
            belongs in your marketing strategy.
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-14">
          {reasons.map((reason) => (
            <div key={reason.number} className="grid gap-4 border-t border-line pt-10 sm:grid-cols-[auto_1fr] sm:gap-10">
              <span className="font-display text-6xl leading-none text-gold sm:text-7xl">
                {reason.number}
              </span>
              <div>
                <h2 className="font-display text-2xl text-ink sm:text-3xl">{reason.title}</h2>
                <div className="mt-4 max-w-[62ch] font-sans text-base leading-relaxed text-body [&>p+p]:mt-4">
                  {reason.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                {reason.pullQuote && (
                  <p className="mt-6 border-l-4 border-teal pl-6 font-display text-xl italic leading-snug text-ink">
                    {reason.pullQuote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border border-line bg-paper p-8 text-center sm:p-12">
          <p className="font-display text-2xl text-ink">
            Thinking about your own open house strategy?
          </p>
          <p className="mx-auto mt-3 max-w-xl font-sans text-sm text-body">
            {brand.broker.name} will help you decide if — and how — an open house fits into
            the marketing plan for your specific property.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={brand.phone.href}
              className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
            >
              Call {brand.phone.display}
            </a>
            <CalendlyButton
              utmContent="open-house-tips-page"
              className="inline-flex min-h-11 items-center justify-center border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal"
            >
              Book a 15-Minute Call
            </CalendlyButton>
          </div>
        </div>
      </section>
    </>
  );
}
