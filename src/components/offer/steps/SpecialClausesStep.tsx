import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

const textareaClass =
  "mt-1.5 block w-full rounded-lg border border-line bg-white px-3 py-2 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40";

export function SpecialClausesStep({
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
      <p className="font-display text-xl text-ink">Special clauses</p>
      <p className="mt-2 font-sans text-sm text-body">
        Anything specific you&rsquo;d like included in the offer? Leave blank if none.
      </p>
      <textarea
        value={value.specialClauses}
        onChange={(e) => onChange({ specialClauses: e.target.value })}
        rows={3}
        placeholder="Optional"
        className={textareaClass}
      />

      <p className="mt-5 font-sans text-sm text-body">
        Is this offer contingent on selling a property you currently own?
      </p>
      <textarea
        value={value.saleOfPropertyNotes}
        onChange={(e) => onChange({ saleOfPropertyNotes: e.target.value })}
        rows={2}
        placeholder="Optional — describe the property and its status, or leave blank if not applicable."
        className={textareaClass}
      />

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} />
    </div>
  );
}
