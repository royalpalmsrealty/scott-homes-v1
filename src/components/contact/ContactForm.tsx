"use client";

import { useId, useState, type FormEvent } from "react";
import { ContactSchema, contactReasons, type ContactInput } from "@/lib/schemas/contact";
import { brand } from "@/lib/brand";

type Status = "idle" | "submitting" | "success" | "error";

const initialValues: ContactInput = {
  name: "",
  email: "",
  phone: "",
  reason: "general",
  message: "",
  company: "",
};

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const formId = useId();

  function update<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = ContactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) throw new Error("submit-failed");

      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="border border-line bg-paper px-6 py-10 text-center sm:px-10"
      >
        <p className="font-display text-2xl text-ink">Message sent.</p>
        <p className="mt-3 font-sans text-sm text-body">
          Thank you for reaching out — {brand.broker.name} typically responds within one
          business day. For anything urgent, call{" "}
          <a href={brand.phone.href} className="font-medium text-teal-deep hover:underline">
            {brand.phone.display}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex min-h-11 items-center justify-center border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
        >
          Send another message
        </button>
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
        <span className="font-sans text-sm font-medium text-ink">I&rsquo;m interested in</span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {contactReasons.map((option) => {
            const checked = values.reason === option.value;
            return (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center justify-center border px-3 py-2 text-center font-sans text-sm transition-colors ${
                  checked
                    ? "border-ink bg-ink text-white"
                    : "border-line text-body hover:border-ink"
                }`}
              >
                <input
                  type="radio"
                  name={`${formId}-reason`}
                  value={option.value}
                  checked={checked}
                  onChange={() => update("reason", option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor={`${formId}-message`} className="font-sans text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          required
          rows={5}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          className={`${fieldBaseClass} resize-none ${errors.message ? errorFieldClass : ""}`}
        />
        {errors.message && (
          <p id={`${formId}-message-error`} className="mt-1.5 font-sans text-sm text-gold-deep">
            {errors.message}
          </p>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="font-sans text-sm text-gold-deep">
          Something went wrong sending your message. Please try again, or call{" "}
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
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
