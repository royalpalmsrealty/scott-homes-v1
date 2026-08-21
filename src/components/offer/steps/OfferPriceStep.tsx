import type { Answers } from "../OfferFlow";
import { StepNav } from "./StepNav";
import type { ListingDetail } from "@/lib/listings/idxScrape";

const inputClass =
  "mt-1.5 block h-11 w-full rounded-lg border border-line bg-white px-3 font-sans text-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40";

export function OfferPriceStep({
  value,
  listing,
  onChange,
  onContinue,
  onBack,
  saving,
}: {
  value: Answers;
  listing: ListingDetail;
  onChange: (v: Partial<Answers>) => void;
  onContinue: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  const price = Number(value.offerPrice);
  const canContinue = Number.isFinite(price) && price > 0;

  return (
    <div>
      <p className="font-display text-xl text-ink">What&rsquo;s your offer price?</p>
      <p className="mt-2 font-sans text-sm text-body">
        The list price is <strong>${listing.price.toLocaleString("en-US")}</strong> — MLS #{listing.listingId}.
      </p>

      <label className="mt-6 block max-w-xs">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Your Offer</span>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-lg text-muted">$</span>
          <input
            type="number"
            inputMode="numeric"
            value={value.offerPrice}
            onChange={(e) => onChange({ offerPrice: e.target.value })}
            className={`${inputClass} pl-7`}
          />
        </div>
      </label>

      <StepNav onBack={onBack} onContinue={onContinue} saving={saving} disabled={!canContinue} />
    </div>
  );
}
