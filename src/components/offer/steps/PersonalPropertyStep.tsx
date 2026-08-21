import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

export function PersonalPropertyStep({
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
      <p className="font-display text-xl text-ink">Personal property</p>
      <p className="mt-2 font-sans text-sm text-body">
        List any personal property you&rsquo;d like included in the sale — appliances, furniture,
        etc. Leave blank if none.
      </p>
      <textarea
        value={value.personalProperty}
        onChange={(e) => onChange({ personalProperty: e.target.value })}
        rows={3}
        placeholder="Optional"
        className="mt-4 block w-full rounded-lg border border-line bg-white px-3 py-2 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40"
      />

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} />
    </div>
  );
}
