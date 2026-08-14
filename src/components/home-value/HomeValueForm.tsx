"use client";

import { useId, useState, type FormEvent } from "react";
import { HomeValueSchema, homeValueTimeframes, type HomeValueInput } from "@/lib/schemas/homeValue";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

type Status = "idle" | "submitting" | "success" | "error";

const initialValues: HomeValueInput = {
  name: "",
  email: "",
  phone: "",
  address: "",
  timeframe: "just-curious",
  company: "",
};

export function HomeValueForm() {
  const [values, setValues] = useState<HomeValueInput>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof HomeValueInput, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submittedContact, setSubmittedContact] = useState<{ name: string; email: string } | null>(null);
  const formId = useId();

  function update<K extends keyof HomeValueInput>(key: K, value: HomeValueInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = HomeValueSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof HomeValueInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof HomeValueInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/home-value", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) throw new Error("submit-failed");

      setSubmittedContact({ name: parsed.data.name, email: parsed.data.email });
      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="border border-line bg-paper px-6 py-10 text-center sm:px-10">
        <p className="font-display text-2xl text-ink">Request received.</p>
        <p className="mt-3 font-sans text-sm text-body">
          {brand.broker.name} personally reviews every valuation request against current
          comparable sales — no automated estimate, no guesswork. Expect a call or email
          within one business day.
        </p>
        <p className="mt-5 font-sans text-sm text-body">
          Want to talk through it sooner? Grab a slot on Scott&rsquo;s calendar directly.
        </p>
        <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <CalendlyButton
            prefill={submittedContact ?? undefined}
            utmContent="home-value-form-success"
            className="inline-flex min-h-11 items-center justify-center bg-teal px-6 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            Book a 15-Minute Call
          </CalendlyButton>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex min-h-11 items-center justify-center border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
          >
            Request another valuation
          </button>
        </div>
      </div>
    );
  }

  const fieldBaseClass =
    "mt-1.5 block w-full border border-line bg-white px-4 py-2.5 font-sans text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep";
  const errorFieldClass = "border-2 border-ink";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hidden from sighted users and screen readers; bots that auto-fill it get silently dropped server-side. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-company`}>Company</label>
        <input
          id={`${formId}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-address`} className="font-sans text-sm font-medium text-ink">
          Property Address
        </label>
        <input
          id={`${formId}-address`}
          type="text"
          placeholder="123 Whitehead St, Key West, FL"
          autoComplete="street-address"
          required
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          aria-invalid={Boolean(errors.address)}
          aria-describedby={errors.address ? `${formId}-address-error` : undefined}
          className={`${fieldBaseClass} ${errors.address ? errorFieldClass : ""}`}
        />
        {errors.address && (
          <p id={`${formId}-address-error`} className="mt-1.5 font-sans text-sm text-gold-deep">
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-name`} className="font-sans text-sm font-medium text-ink">
          Full Name
        </label>
        <input
          id={`${formId}-name`}
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          className={`${fieldBaseClass} ${errors.name ? errorFieldClass : ""}`}
        />
        {errors.name && (
          <p id={`${formId}-name-error`} className="mt-1.5 font-sans text-sm text-gold-deep">
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-email`} className="font-sans text-sm font-medium text-ink">
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            className={`${fieldBaseClass} ${errors.email ? errorFieldClass : ""}`}
          />
          {errors.email && (
            <p id={`${formId}-email-error`} className="mt-1.5 font-sans text-sm text-gold-deep">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className="font-sans text-sm font-medium text-ink">
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldBaseClass}
          />
        </div>
      </div>

      <div>
        <span className="font-sans text-sm font-medium text-ink">Thinking of selling</span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {homeValueTimeframes.map((option) => {
            const checked = values.timeframe === option.value;
            return (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center justify-center border px-3 py-2 text-center font-sans text-sm transition-colors ${
                  checked ? "border-ink bg-ink text-white" : "border-line text-body hover:border-ink"
                }`}
              >
                <input
                  type="radio"
                  name={`${formId}-timeframe`}
                  value={option.value}
                  checked={checked}
                  onChange={() => update("timeframe", option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>

      {status === "error" && (
        <p role="alert" className="font-sans text-sm text-gold-deep">
          Something went wrong sending your request. Please try again, or call{" "}
          <a href={brand.phone.href} className="font-medium underline">
            {brand.phone.display}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Get My Home Value"}
      </button>
    </form>
  );
}
