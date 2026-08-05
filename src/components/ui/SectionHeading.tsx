type SectionHeadingProps = {
  eyebrow: string;
  heading: string;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  /** "ink" (default) for light backgrounds, "white" for dark/video sections. */
  tone?: "ink" | "white";
  /** Set when tone="white" sits directly over video, not a flat dark bg —
   * adds letterform-hugging shadow instead of a background shape. */
  shadow?: boolean;
  className?: string;
};

// The site's signature structural device: gold eyebrow, display heading, gold
// hairline rule. Repeats at the head of every major section — do not vary it.
export function SectionHeading({
  eyebrow,
  heading,
  as = "h2",
  align = "left",
  tone = "ink",
  shadow = false,
  className = "",
}: SectionHeadingProps) {
  const Heading = as;
  const isCentered = align === "center";
  // On a dark ground, --gold-deep (tuned for white backgrounds) falls short of
  // 4.5:1 — plain --gold clears it there, so eyebrow color flips with tone.
  const eyebrowClass = tone === "white" ? "text-gold" : "text-gold-deep";
  const headingClass = tone === "white" ? "text-white" : "text-ink";
  const shadowClass = shadow ? "text-on-video" : "";

  return (
    <div className={`flex flex-col ${isCentered ? "items-center text-center" : "items-start text-left"} ${className}`}>
      <span className={`font-sans text-[11px] font-medium uppercase tracking-[0.18em] ${eyebrowClass} ${shadowClass}`}>
        {eyebrow}
      </span>
      <Heading className={`mt-2 font-display text-3xl leading-tight ${headingClass} ${shadowClass} sm:text-4xl`}>
        {heading}
      </Heading>
      <span className="mt-4 h-px w-16 bg-gold" aria-hidden="true" />
    </div>
  );
}
