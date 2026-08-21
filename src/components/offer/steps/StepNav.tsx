export function StepNav({
  onBack,
  onContinue,
  saving,
  disabled,
  continueLabel = "Continue",
}: {
  onBack: () => void;
  onContinue: () => void;
  saving: boolean;
  disabled?: boolean;
  continueLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 font-sans text-sm font-medium text-body transition-colors hover:border-teal/50 hover:text-ink"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onContinue}
        disabled={disabled || saving}
        className="inline-flex h-11 items-center justify-center rounded-full bg-teal px-6 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal-deep disabled:opacity-50"
      >
        {saving ? "Saving…" : continueLabel}
      </button>
    </div>
  );
}
