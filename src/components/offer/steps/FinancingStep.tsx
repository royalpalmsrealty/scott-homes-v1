import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

export function FinancingStep({
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
      <p className="font-display text-xl text-ink">Cash or financing?</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {(["cash", "financed"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange({ financing: option })}
            aria-pressed={value.financing === option}
            className={`flex-1 rounded-xl border px-5 py-4 text-left font-sans text-sm font-medium transition-colors ${
              value.financing === option
                ? "border-teal bg-teal/10 text-teal-deep"
                : "border-line text-body hover:border-teal/40"
            }`}
          >
            {option === "cash" ? "Cash Offer" : "Financed"}
          </button>
        ))}
      </div>

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} disabled={!value.financing} />
    </div>
  );
}
