import { brand } from "@/lib/brand";
import { testimonials } from "@/lib/testimonials";
import { TestimonialCarousel } from "./TestimonialCarousel";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-ink py-14 sm:py-24">
      <span
        className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full opacity-10 blur-[100px]"
        aria-hidden="true"
        style={{ background: "var(--teal)" }}
      />
      <span
        className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full opacity-10 blur-[100px]"
        aria-hidden="true"
        style={{ background: "var(--gold)" }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            testimonials.map((t) => ({
              "@context": "https://schema.org",
              "@type": "Review",
              author: { "@type": "Person", name: t.name },
              reviewBody: t.quote,
              itemReviewed: {
                "@type": "LocalBusiness",
                name: brand.brokerage,
              },
            }))
          ),
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-teal">
            Client Stories
          </span>
          <h2 className="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl">
            What Clients Are Saying
          </h2>
          <span
            className="mt-4 h-px w-16"
            aria-hidden="true"
            style={{ background: "linear-gradient(90deg, var(--teal), var(--gold))" }}
          />
        </div>

        <div className="mt-12">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}
