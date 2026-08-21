import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

export function ClosingDateStep({
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
  return (
    <div>
      <p className="font-display text-xl text-ink">Proposed closing date</p>

      <label className="mt-4 block max-w-xs">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Closing Date</span>
        <input
          type="date"
          value={value.closingDate}
          onChange={(e) => onChange({ closingDate: e.target.value })}
          className="mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
        />
      </label>

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} disabled={!value.closingDate} />
    </div>
  );
}
