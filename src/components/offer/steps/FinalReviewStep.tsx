"use client";

import { useState } from "react";
import type { Answers } from "../OfferFlow";
import type { ListingDetail } from "@/lib/listings/idxScrape";

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="font-sans text-sm text-muted">{label}</span>
      <span className="font-sans text-sm text-ink text-right">{value}</span>
    </div>
  );
}

export function FinalReviewStep({
  answers,
  listing,
  offerId,
  onBack,
  onSubmitted,
}: {
  answers: Answers;
  listing: ListingDetail;
  offerId: string;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${offerId}/submit`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Couldn't submit the offer.");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit the offer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="font-display text-xl text-ink">Review your offer</p>
      <p className="mt-2 font-sans text-sm text-body">
        Check everything below — you can go back and correct anything before submitting.
      </p>

      <div className="mt-6 rounded-xl border border-line bg-paper p-5">
        <Row label="Property" value={`${listing.address}, ${listing.city}`} />
        <Row label="List Price" value={`$${listing.price.toLocaleString("en-US")}`} />
        <Row label="Buyer" value={answers.buyerName} />
        <Row label="Contact" value={[answers.buyerEmail, answers.buyerPhone].filter(Boolean).join(" · ")} />
        <Row label="Offer Price" value={answers.offerPrice ? `$${Number(answers.offerPrice).toLocaleString("en-US")}` : ""} />
        <Row
          label="Escrow Deposit"
          value={
            answers.escrowAmount
              ? `$${Number(answers.escrowAmount).toLocaleString("en-US")}`
              : answers.escrowPercent
                ? `${answers.escrowPercent}%`
                : ""
          }
        />
        <Row label="Financing" value={answers.financing === "cash" ? "Cash" : answers.financing === "financed" ? "Financed" : ""} />
        <Row label="Inspection Period" value={answers.inspectionDays ? `${answers.inspectionDays} days` : ""} />
        <Row label="Title Costs Note" value={answers.titleCostsNote} />
        <Row label="Closing Date" value={answers.closingDate} />
        <Row label="Special Clauses" value={answers.specialClauses} />
        <Row label="Sale of Current Property" value={answers.saleOfPropertyNotes} />
        <Row label="Personal Property" value={answers.personalProperty} />
        <Row label="Title Taken As" value={answers.titleTakenAs} />
      </div>

      <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4">
        <p className="font-sans text-xs text-ink">
          This is a summary of your intended offer, not a binding contract. Scott will follow up
          directly to prepare and finalize the actual purchase agreement.
        </p>
      </div>

      {error && <p className="mt-4 font-sans text-sm text-gold-deep">{error}</p>}

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
          onClick={submit}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-full bg-teal px-6 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal-deep disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Confirm & Submit Offer"}
        </button>
      </div>
    </div>
  );
}
