import { brand } from "@/lib/brand";

type Badge = { label: string; emphasis?: boolean; serif?: boolean };

// Honest, non-fabricated badges only — no invented years-of-experience or
// ranking claims. License number stays a placeholder until confirmed (§15).
const badges: Badge[] = [
  { label: brand.broker.title, emphasis: true },
  { label: "Key West, FL" },
  { label: "REALTOR®", serif: true },
  { label: "Equal Housing Opportunity", emphasis: true },
  { label: "FL License #: TODO-CLIENT-ASSET" },
  { label: brand.brokerage, serif: true },
];

function BadgeItem({ label, emphasis, serif }: Badge) {
  if (emphasis) {
    return (
      <span className="inline-flex h-11 items-center whitespace-nowrap bg-ink px-5 font-sans text-xs font-medium uppercase tracking-[0.14em] text-white">
        {label}
      </span>
    );
  }
  return (
    <span
      className={
        serif
          ? "whitespace-nowrap font-display text-xl text-ink"
          : "whitespace-nowrap font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted"
      }
    >
      {label}
    </span>
  );
}

function BadgeRow({ items, hidden }: { items: Badge[]; hidden?: boolean }) {
  return (
    <span className="flex items-center gap-10" aria-hidden={hidden || undefined}>
      {items.map((badge, i) => (
        <span key={i} className="flex items-center gap-10">
          {i !== 0 && (
            <span className="h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          )}
          <BadgeItem {...badge} />
        </span>
      ))}
    </span>
  );
}

export function CredentialsTicker() {
  return (
    <div
      className="ticker-mask ticker-wrap border-y border-line py-5"
      // The logo's two accent colors — teal from the eye, gold from the
      // wordmark — reading left to right like the logo itself.
      style={{
        background:
          "linear-gradient(90deg, rgba(40,188,184,0.28) 0%, rgba(40,188,184,0.10) 32%, var(--paper) 50%, rgba(150,128,46,0.10) 68%, rgba(150,128,46,0.28) 100%)",
      }}
    >
      {/* Doubled so the track can loop seamlessly at translateX(-50%) — the
          second copy is aria-hidden so screen readers hear each badge once. */}
      <div className="ticker-track flex w-max items-center gap-10">
        <BadgeRow items={badges} />
        <span className="h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
        <BadgeRow items={badges} hidden />
      </div>
    </div>
  );
}
