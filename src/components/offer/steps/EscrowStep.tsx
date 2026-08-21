import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

const inputClass =
  "mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40";

export function EscrowStep({
  value,
  onChange,
  onContinue,
  onBack,
  saving,
}: {
  value: Answers;
  onChange: (v: Partial<Answers>) => void;
  onContinue: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  const canContinue = Boolean(value.escrowAmount) || Boolean(value.escrowPercent);

  return (
    <div>
      <p className="font-display text-xl text-ink">Escrow deposit</p>
      <p className="mt-2 max-w-xl font-sans text-sm text-body">
        An escrow deposit of at least 10% of the offer price is customary in this market. 20% or
        more is generally seen as a stronger offer — this is context, not a requirement.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Deposit Amount ($)</span>
          <input
            type="number"
            inputMode="numeric"
            value={value.escrowAmount}
            onChange={(e) => onChange({ escrowAmount: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Or as a % of offer price</span>
          <input
            type="number"
            inputMode="numeric"
            value={value.escrowPercent}
            onChange={(e) => onChange({ escrowPercent: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} disabled={!canContinue} />
    </div>
  );
}
