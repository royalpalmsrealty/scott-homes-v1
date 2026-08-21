import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

export function TitleCostsStep({
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
      <p className="font-display text-xl text-ink">Title insurance costs</p>
      <p className="mt-2 max-w-xl font-sans text-sm text-body">
        Title insurance costs are customarily paid by the seller in this market, though this is
        negotiable. Note anything you&rsquo;d like to propose here (optional).
      </p>

      <textarea
        value={value.titleCostsNote}
        onChange={(e) => onChange({ titleCostsNote: e.target.value })}
        rows={3}
        placeholder="Optional — leave blank to accept the customary arrangement."
        className="mt-4 block w-full rounded-lg border border-line bg-white px-3 py-2 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40"
      />

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} />
    </div>
  );
}
