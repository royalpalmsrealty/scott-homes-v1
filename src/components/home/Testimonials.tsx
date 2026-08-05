import { brand } from "@/lib/brand";

type Testimonial = {
  name: string;
  initials: string;
  meta: string;
  timeAgo: string;
  rating: number;
  quote: string;
};

// Verbatim positive Google reviews, reproduced as supplied.
const testimonials: Testimonial[] = [
  {
    name: "Roxane Mitchell",
    initials: "RM",
    meta: "Local Guide · 22 reviews · 16 photos",
    timeAgo: "6 years ago",
    rating: 5,
    quote:
      "Paola helped us find the perfect rental while waiting for military housing. She was very responsive and always ready to help even on the week-ends. We are forever grateful to Royal Palms Realty and highly recommend them!",
  },
  {
    name: "Tonia Sheppard",
    initials: "TS",
    meta: "Local Guide · 48 reviews",
    timeAgo: "9 years ago",
    rating: 5,
    quote:
      "Top notch service from signing to closing. You will not find a realtor and staff that will work as hard for you as Scott and Sara. Thank you both for making it such a pleasurable experience.",
  },
];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.8 7.1-.7z"
        fill={filled ? "var(--teal)" : "none"}
        stroke="var(--teal)"
        strokeWidth="1"
      />
    </svg>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    // Gradient border via padding trick: outer layer is the teal→gold
    // gradient itself, inner layer is the card — a 1px "border" that's
    // actually a full gradient ring, not just a flat line.
    <div
      className="h-full p-px transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(40,188,184,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ background: "linear-gradient(135deg, var(--teal) 0%, rgba(150,128,46,0.7) 100%)" }}
    >
      <div className="relative flex h-full flex-col overflow-hidden bg-ink p-8">
        {/* Ambient glow, unique to each card so the row doesn't feel repetitive. */}
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-15 blur-3xl"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />

        <span
          className="pointer-events-none absolute -top-3 left-6 font-display text-6xl text-gold/30"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <div className="relative flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i < testimonial.rating} />
          ))}
        </div>
        <span className="sr-only">{testimonial.rating} out of 5 stars</span>

        <p className="relative mt-5 flex-1 font-display text-lg italic leading-relaxed text-white/90">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        <div className="relative mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center font-sans text-xs font-semibold text-white"
            aria-hidden="true"
            style={{
              background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)",
            }}
          >
            {testimonial.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-medium text-white">{testimonial.name}</p>
            <p className="mt-0.5 truncate font-sans text-xs text-white/55">{testimonial.meta}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-sans text-xs text-white/55">Google Review</p>
            <p className="mt-0.5 font-sans text-xs text-white/55">{testimonial.timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
              reviewRating: {
                "@type": "Rating",
                ratingValue: t.rating,
                bestRating: "5",
                worstRating: "1",
              },
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
        <div className="flex flex-col items-start text-left">
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
        <div className="mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
