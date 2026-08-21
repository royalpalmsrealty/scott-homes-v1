"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ListingDetail } from "@/lib/listings/idxScrape";
import { BuyerInfoStep } from "./steps/BuyerInfoStep";
import { OfferPriceStep } from "./steps/OfferPriceStep";
import { EscrowStep } from "./steps/EscrowStep";
import { FinancingStep } from "./steps/FinancingStep";
import { InspectionStep } from "./steps/InspectionStep";
import { TitleCostsStep } from "./steps/TitleCostsStep";
import { ClosingDateStep } from "./steps/ClosingDateStep";
import { SpecialClausesStep } from "./steps/SpecialClausesStep";
import { PersonalPropertyStep } from "./steps/PersonalPropertyStep";
import { TitleTakenStep } from "./steps/TitleTakenStep";
import { DocumentUploadStep } from "./steps/DocumentUploadStep";
import { FinalReviewStep } from "./steps/FinalReviewStep";

export type Answers = {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  offerPrice: string;
  escrowAmount: string;
  escrowPercent: string;
  financing: "cash" | "financed" | "";
  inspectionDays: string;
  titleCostsNote: string;
  closingDate: string;
  specialClauses: string;
  saleOfPropertyNotes: string;
  personalProperty: string;
  titleTakenAs: string;
};

const EMPTY_ANSWERS: Answers = {
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  offerPrice: "",
  escrowAmount: "",
  escrowPercent: "",
  financing: "",
  inspectionDays: "",
  titleCostsNote: "",
  closingDate: "",
  specialClauses: "",
  saleOfPropertyNotes: "",
  personalProperty: "",
  titleTakenAs: "",
};

const STEP_LABELS = [
  "Your Info",
  "Offer Price",
  "Escrow Deposit",
  "Financing",
  "Inspection Period",
  "Title Costs",
  "Closing Date",
  "Special Clauses",
  "Personal Property",
  "How Title Is Taken",
  "Documents",
  "Review & Submit",
];

export function OfferFlow({ listing, addressSlug }: { listing: ListingDetail; addressSlug: string }) {
  const [offerId, setOfferId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Create the draft offer as soon as the page loads — document uploads and
  // "talk to a live agent" both need a real offer id to exist from the start,
  // not just once the buyer reaches the final step.
  useEffect(() => {
    fetch("/api/offers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId: listing.listingId, addressSlug }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.offerId) throw new Error(data?.error || "Couldn't start an offer.");
        setOfferId(data.offerId);
      })
      .catch((err) => setInitError(err instanceof Error ? err.message : "Couldn't start an offer."));
    // listing is a stable server-provided prop for this page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patch(fields: Record<string, unknown>) {
    if (!offerId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Couldn't save that — please try again.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save that.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function goNext(fields: Record<string, unknown>) {
    try {
      await patch(fields);
      setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    } catch {
      // saveError is already set — stay on this step so the buyer can retry.
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (initError) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center">
        <p className="font-sans text-base text-body">{initError}</p>
        <Link href={`/listings/${listing.listingId}-${addressSlug}`} className="mt-4 inline-block font-sans text-sm font-medium text-teal-deep hover:underline">
          &larr; Back to the listing
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-teal/30 bg-teal/10 p-8 text-center">
        <p className="font-display text-xl text-ink">Offer submitted</p>
        <p className="mt-2 font-sans text-sm text-body">
          Thanks — your offer summary has been sent to Scott. This is not a binding contract; Scott
          will follow up directly to move forward.
        </p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 font-sans text-sm font-medium text-white hover:bg-teal hover:text-ink">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-muted">
          Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
        </p>
        <button
          type="button"
          onClick={() => setEscalateOpen((o) => !o)}
          className="font-sans text-xs font-medium text-teal-deep hover:underline"
        >
          Talk to a live agent
        </button>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-teal transition-all"
          style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
        />
      </div>

      {escalateOpen && offerId && (
        <EscalateForm offerId={offerId} onDone={() => setEscalateOpen(false)} />
      )}

      {saveError && <p className="mt-4 font-sans text-sm text-gold-deep">{saveError}</p>}

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
        {step === 0 && (
          <BuyerInfoStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ buyerName: answers.buyerName, buyerEmail: answers.buyerEmail, buyerPhone: answers.buyerPhone })}
            saving={saving}
          />
        )}
        {step === 1 && (
          <OfferPriceStep
            value={answers}
            listing={listing}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ offerPrice: Number(answers.offerPrice) })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 2 && (
          <EscrowStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() =>
              goNext({
                escrowAmount: answers.escrowAmount ? Number(answers.escrowAmount) : undefined,
                escrowPercent: answers.escrowPercent ? Number(answers.escrowPercent) : undefined,
              })
            }
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 3 && (
          <FinancingStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ financing: answers.financing })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 4 && (
          <InspectionStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ inspectionDays: Number(answers.inspectionDays), inspectionReminderShown: true })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 5 && (
          <TitleCostsStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ titleCostsNote: answers.titleCostsNote })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 6 && (
          <ClosingDateStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ closingDate: answers.closingDate })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 7 && (
          <SpecialClausesStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ specialClauses: answers.specialClauses, saleOfPropertyNotes: answers.saleOfPropertyNotes })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 8 && (
          <PersonalPropertyStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ personalProperty: answers.personalProperty })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 9 && (
          <TitleTakenStep
            value={answers}
            onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
            onContinue={() => goNext({ titleTakenAs: answers.titleTakenAs })}
            onBack={goBack}
            saving={saving}
          />
        )}
        {step === 10 && offerId && (
          <DocumentUploadStep offerId={offerId} onContinue={() => setStep((s) => s + 1)} onBack={goBack} />
        )}
        {step === 11 && offerId && (
          <FinalReviewStep
            answers={answers}
            listing={listing}
            offerId={offerId}
            onBack={goBack}
            onSubmitted={() => setSubmitted(true)}
          />
        )}
      </div>
    </div>
  );
}

function EscalateForm({ offerId, onDone }: { offerId: string; onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/offers/${offerId}/escalate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ callbackPhone: phone, callbackBestTime: bestTime, company }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setTimeout(onDone, 1500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-5">
      {status === "done" ? (
        <p className="font-sans text-sm text-ink">Got it — Scott's been notified and will call you back.</p>
      ) : (
        <>
          <p className="font-sans text-sm font-medium text-ink">Request a callback from Scott</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="h-10 flex-1 rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
            <input
              type="text"
              value={bestTime}
              onChange={(e) => setBestTime(e.target.value)}
              placeholder="Best time to call (optional)"
              className="h-10 flex-1 rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
          </div>
          {/* Honeypot — hidden from real visitors via CSS, not display:none (some bots skip those). */}
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={!phone || status === "saving"}
              className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink disabled:opacity-50"
            >
              {status === "saving" ? "Sending…" : "Request Callback"}
            </button>
            {status === "error" && <span className="font-sans text-xs text-gold-deep">Couldn&rsquo;t send that — try again.</span>}
          </div>
        </>
      )}
    </div>
  );
}
