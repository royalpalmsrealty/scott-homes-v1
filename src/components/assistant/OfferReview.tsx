"use client";

import { useEffect, useRef } from "react";
import { acceptOfferSuggestion, canBeginOffer, getIntakeFields, getOfferGuidance, needsAgentCoordination, validateIntakeField, type IntakeDraft } from "@/lib/offerIntake";
import { brand } from "@/lib/brand";

export function OfferReview({ draft, busy, confirmed, propertyPending, onChange, onConfirm, onPropertyBlur, onSubmit }: {
  draft: IntakeDraft;
  busy: boolean;
  confirmed: boolean;
  propertyPending: boolean;
  onChange: (patch: Partial<IntakeDraft>) => void;
  onConfirm: (confirmed: boolean) => void;
  onPropertyBlur: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const fields = getIntakeFields(draft);
  const issues = fields.filter(field => validateIntakeField(field.key, draft));
  const relationshipResolved = canBeginOffer(draft.representation);
  const canConfirm = issues.length === 0 && !busy && !propertyPending;

  return <form aria-label="Offer summary" noValidate className="space-y-5" onSubmit={event => {
    event.preventDefault();
    if (canConfirm && confirmed) void onSubmit();
  }}>
    <div className="space-y-2">
      <h3 ref={heading} tabIndex={-1} className="font-display text-2xl outline-none">Review your offer</h3>
      <p className="text-sm text-muted">Your answers are filled in below. Edit anything here, then confirm and send.</p>
      {issues.length > 0 && <p role="status" className="text-sm text-amber-800">{issues.length} {issues.length === 1 ? "detail needs" : "details need"} attention below.</p>}
    </div>
    <div className="divide-y divide-line">
      {fields.map(field => {
        const id = `offer-review-${field.key}`;
        const value = draft[field.key];
        const issue = validateIntakeField(field.key, draft);
        const guidance = !value.trim() ? getOfferGuidance(field.key, draft) : undefined;
        const disabled = busy || (field.key !== "representation" && !relationshipResolved);
        const inputProps = {
          id, name: field.key, value, disabled, required: true,
          "aria-invalid": Boolean(issue),
          "aria-describedby": [field.key === "conditions" ? `${id}-question` : "", issue ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined,
          onChange: (event: { target: { value: string } }) => onChange({ [field.key]: event.target.value }),
          onBlur: field.key === "propertyReference" ? onPropertyBlur : undefined,
          className: `w-full rounded-lg border bg-white p-3 text-base disabled:bg-paper disabled:text-muted ${issue ? "border-amber-500" : "border-line"}`,
        };
        return <div key={field.key} className="space-y-2 py-4">
          <label htmlFor={id} className="block text-sm font-medium">{field.label}{field.key === "offerPrice" ? " (USD)" : ""}</label>
          {field.key === "conditions" && <p id={`${id}-question`} className="text-sm text-muted">{field.question}</p>}
          {field.type === "select" ? <select {...inputProps}>
            <option value="">Choose an answer</option>
            {field.options.map(option => typeof option === "string" ? <option key={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
          </select> : field.type === "textarea" ? <textarea {...inputProps} rows={4} maxLength={4000} /> : <input {...inputProps} type={field.type} maxLength={field.key === "buyerName" ? 200 : field.key === "buyerEmail" ? 254 : field.key === "buyerPhone" ? 40 : 500} min={field.type === "number" ? "0.01" : undefined} step={field.type === "number" ? "0.01" : undefined} autoComplete={field.key === "buyerEmail" ? "email" : field.key === "buyerPhone" ? "tel" : field.key === "buyerName" ? "name" : "off"} />}
          {issue && <p id={`${id}-error`} className="text-xs text-amber-800">{!value.trim() ? "Required" : issue}</p>}
          {field.key === "representation" && !relationshipResolved && <p className="text-sm text-muted">{needsAgentCoordination(value) ? <>Please <a href={brand.phone.href} className="text-teal-deep underline">contact our office</a> so we can coordinate your existing-agent status.</> : "Add your existing-agent answer to continue."}</p>}
          {guidance && !disabled && <details className="rounded-lg bg-paper px-3 py-2 text-sm">
            <summary className="cursor-pointer text-teal-deep">See our suggestion</summary>
            <p className="mt-3 leading-6">{guidance.text}</p>
            <button type="button" className="mt-3 rounded-full border border-teal-deep px-4 py-2 text-teal-deep" onClick={() => onChange(acceptOfferSuggestion(field.key, draft))}>{guidance.action}</button>
          </details>}
        </div>;
      })}
    </div>
    {propertyPending && <p className="text-sm text-muted">Finish identifying the property above before sending.</p>}
    <label className="flex items-start gap-3 text-sm leading-6">
      <input type="checkbox" className="mt-1 size-4 shrink-0" checked={confirmed} disabled={!canConfirm} onChange={event => onConfirm(event.target.checked)} />
      <span>I have reviewed these details and ask Scott to contact me about preparing an offer. This is an inquiry for broker review, not a signed purchase offer.</span>
    </label>
    <button type="submit" disabled={!canConfirm || !confirmed} className="w-full rounded-full bg-teal-deep px-5 py-3 font-medium text-white disabled:opacity-40">{busy ? "Saving your request…" : "Send request for Scott’s review"}</button>
  </form>;
}
