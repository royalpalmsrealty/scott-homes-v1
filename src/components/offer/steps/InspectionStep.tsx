import { useState } from "react";
import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

const inputClass =
  "mt-1.5 block h-10 w-32 rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40";

export function InspectionStep({
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
  const [acknowledged, setAcknowledged] = useState(false);
  const days = Number(value.inspectionDays);
  const canContinue = Number.isFinite(days) && days >= 0 && acknowledged;

  return (
    <div>
      <p className="font-display text-xl text-ink">Inspection period</p>

      <label className="mt-4 block">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Length (days)</span>
        <input
          type="number"
          inputMode="numeric"
          value={value.inspectionDays}
          onChange={(e) => onChange({ inspectionDays: e.target.value })}
          className={inputClass}
        />
      </label>

      {/* Required verbatim per the offer guide — do not paraphrase this. */}
      <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4">
        <p className="font-sans text-sm font-medium text-ink">
          Keep in mind that the inspection period is the only time you can cancel without giving a
          reason. If you change your mind for any reason, you must cancel during this period to
          avoid being in default.
        </p>
      </div>

      <label className="mt-4 flex items-start gap-2">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-line text-teal focus:ring-teal/40"
        />
        <span className="font-sans text-sm text-body">I understand the inspection-period terms above.</span>
      </label>

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} disabled={!canContinue} />
    </div>
  );
}
