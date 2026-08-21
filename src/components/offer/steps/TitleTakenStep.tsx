import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";

export function TitleTakenStep({
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
      <p className="font-display text-xl text-ink">How will title be taken?</p>
      <p className="mt-2 max-w-xl font-sans text-sm text-body">
        Tell us the name(s) and form of ownership you&rsquo;d like on the deed (e.g. "Jane Doe, a
        single woman" or "John and Jane Doe, husband and wife"). We don&rsquo;t recommend a
        particular ownership structure — for guidance on what's right for your situation, consult
        an attorney or tax advisor.
      </p>
      <input
        type="text"
        value={value.titleTakenAs}
        onChange={(e) => onChange({ titleTakenAs: e.target.value })}
        className="mt-4 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
      />

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} disabled={!value.titleTakenAs.trim()} />
    </div>
  );
}
