import { useState } from "react";
import { StepNav } from "./StepNav";
import type { UploadDocumentKind } from "@/lib/schemas/offer";

const SLOTS: { kind: UploadDocumentKind; label: string; required: boolean }[] = [
  { kind: "photo_id", label: "Photo ID", required: true },
  { kind: "proof_of_funds", label: "Proof of Funds", required: true },
  { kind: "preapproval", label: "Preapproval Letter", required: false },
  { kind: "contingency", label: "Contingency Documents", required: false },
];

type SlotStatus = "idle" | "uploading" | "done" | "error";

export function DocumentUploadStep({
  offerId,
  onContinue,
  onBack,
}: {
  offerId: string;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<Record<UploadDocumentKind, SlotStatus>>({
    photo_id: "idle",
    proof_of_funds: "idle",
    preapproval: "idle",
    contingency: "idle",
  });

  async function upload(kind: UploadDocumentKind, file: File) {
    setStatus((s) => ({ ...s, [kind]: "uploading" }));
    const form = new FormData();
    form.set("kind", kind);
    form.set("file", file);
    form.set("company", ""); // honeypot — always empty for a real buyer
    try {
      const res = await fetch(`/api/offers/${offerId}/documents`, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      setStatus((s) => ({ ...s, [kind]: "done" }));
    } catch {
      setStatus((s) => ({ ...s, [kind]: "error" }));
    }
  }

  const requiredDone = SLOTS.filter((s) => s.required).every((s) => status[s.kind] === "done");

  return (
    <div>
      <p className="font-display text-xl text-ink">Supporting documents</p>
      <p className="mt-2 max-w-xl font-sans text-sm text-body">
        These go into a private, access-controlled record tied to this offer only — never into any
        AI training data or chat history. Photo ID and proof of funds are required; a preapproval
        letter and any contingency documents are optional.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SLOTS.map((slot) => (
          <div key={slot.kind} className="rounded-xl border border-line bg-paper p-4">
            <p className="font-sans text-sm font-medium text-ink">
              {slot.label} {slot.required && <span className="text-gold-deep">*</span>}
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(slot.kind, file);
              }}
              className="mt-2 block w-full font-sans text-xs text-body"
            />
            <p className="mt-1 font-sans text-xs text-muted">
              {status[slot.kind] === "uploading" && "Uploading…"}
              {status[slot.kind] === "done" && "Uploaded"}
              {status[slot.kind] === "error" && "Upload failed — try again"}
            </p>
          </div>
        ))}
      </div>

      <StepNav onBack={onBack} onContinue={onContinue} saving={false} disabled={!requiredDone} continueLabel="Continue" />
    </div>
  );
}
