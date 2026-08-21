import type { Answers } from "../OfferFlow";

const inputClass =
  "mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40";

export function BuyerInfoStep({
  value,
  onChange,
  onContinue,
  saving,
}: {
  value: Answers;
  onChange: (v: Partial<Answers>) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  const canContinue = value.buyerName.trim().length > 1 && /\S+@\S+\.\S+/.test(value.buyerEmail) && value.buyerPhone.trim().length > 6;

  return (
    <div>
      <p className="font-display text-xl text-ink">Let&rsquo;s start with you</p>
      <p className="mt-2 font-sans text-sm text-body">
        We&rsquo;ll use this to send you the offer summary and to reach you if anything needs
        clarifying.
      </p>

      <label className="mt-6 block">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Full Name</span>
        <input
          type="text"
          value={value.buyerName}
          onChange={(e) => onChange({ buyerName: e.target.value })}
          className={inputClass}
        />
      </label>
      <label className="mt-4 block">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Email</span>
        <input
          type="email"
          value={value.buyerEmail}
          onChange={(e) => onChange({ buyerEmail: e.target.value })}
          className={inputClass}
        />
      </label>
      <label className="mt-4 block">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Phone</span>
        <input
          type="tel"
          value={value.buyerPhone}
          onChange={(e) => onChange({ buyerPhone: e.target.value })}
          className={inputClass}
        />
      </label>

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue || saving}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal px-6 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal-deep disabled:opacity-50"
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
