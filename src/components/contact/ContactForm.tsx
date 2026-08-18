"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ContactSchema, contactReasons, type ContactInput } from "@/lib/schemas/contact";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
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

// Each reason gets its own icon + color so the row reads at a glance instead
// of as four identical gray boxes with different words in them.
const reasonStyles: Record<
  ContactInput["reason"],
  { icon: ReactNode; active: string; iconIdle: string }
> = {
  buying: { icon: <HouseIcon />, active: "border-teal bg-teal text-ink", iconIdle: "text-teal-deep" },
  selling: { icon: <TagIcon />, active: "border-gold bg-gold text-ink", iconIdle: "text-gold-deep" },
  renting: { icon: <KeyIcon />, active: "border-[var(--teal-deep)] bg-[var(--teal-deep)] text-white", iconIdle: "text-teal-deep" },
  general: { icon: <ChatIcon />, active: "border-ink bg-ink text-white", iconIdle: "text-muted" },
};

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submittedContact, setSubmittedContact] = useState<{ name: string; email: string } | null>(null);
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

      setSubmittedContact({ name: parsed.data.name, email: parsed.data.email });
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
        className="rounded-2xl border border-line bg-paper px-6 py-10 text-center shadow-sm sm:px-10"
      >
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-ink"
          style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
          aria-hidden="true"
        >
          <CheckIcon />
        </span>
        <p className="mt-4 font-display text-2xl text-ink">Message sent.</p>
        <p className="mt-3 font-sans text-sm text-body">
          Thank you for reaching out — {brand.broker.name} typically responds within one
          business day. For anything urgent, call{" "}
          <a href={brand.phone.href} className="font-medium text-teal-deep hover:underline">
            {brand.phone.display}
          </a>
          .
        </p>
        <p className="mt-5 font-sans text-sm text-body">
          Want to skip the wait? Grab a slot on Scott&rsquo;s calendar directly.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <CalendlyButton
            prefill={submittedContact ?? undefined}
            utmContent="contact-form-success"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-6 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            Book a 15-Minute Call
          </CalendlyButton>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const fieldBaseClass =
    "mt-1.5 block w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 font-sans text-base text-ink placeholder:text-muted transition-colors focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20";
  const errorFieldClass = "border-2 border-gold-deep focus:border-gold-deep focus:ring-gold-deep/20";

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold-deep">
        Send a Message
      </span>
      <span className="mt-2 block h-px w-12 bg-gold" aria-hidden="true" />
      <p className="mt-3 font-sans text-xs text-muted">
        Fields marked <span className="font-medium text-teal-deep">*</span> are required.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
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
            Full Name <span className="text-teal-deep">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-teal-deep">
              <UserIcon />
            </span>
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
          </div>
          {errors.name && (
            <p id={`${formId}-name-error`} className="mt-1.5 font-sans text-sm text-gold-deep">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-email`} className="font-sans text-sm font-medium text-ink">
              Email <span className="text-teal-deep">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-teal-deep">
                <MailIcon />
              </span>
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
            </div>
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
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-teal-deep">
                <PhoneSmallIcon />
              </span>
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
        </div>

        <div>
          <span className="font-sans text-sm font-medium text-ink">
            I&rsquo;m interested in <span className="text-teal-deep">*</span>
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {contactReasons.map((option) => {
              const checked = values.reason === option.value;
              const style = reasonStyles[option.value];
              return (
                <label
                  key={option.value}
                  className={`flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2 text-center font-sans text-sm transition-colors ${
                    checked ? style.active : `border-line text-body hover:border-ink ${style.iconIdle}`
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
                  <span className={checked ? "" : style.iconIdle}>{style.icon}</span>
                  <span className={checked ? "font-medium" : ""}>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-message`} className="font-sans text-sm font-medium text-ink">
            Message <span className="text-teal-deep">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-3.5 text-teal-deep">
              <MessageIcon />
            </span>
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
          </div>
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
          className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--gold) 100%)" }}
        >
          {status === "submitting" ? (
            "Sending…"
          ) : (
            <>
              Send Message
              <SendIcon />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.5-4 5-6 7.5-6s6 2 7.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6l8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PhoneSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8C8.1 13.8 10.2 15.9 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.5 21.4 2.6 13.5 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16v10H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11l8-7 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 19v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11.3 3.7L20 12.4a1.5 1.5 0 0 1 0 2.1l-5.5 5.5a1.5 1.5 0 0 1-2.1 0L3.7 11.3a1.5 1.5 0 0 1-.4-1V4a1 1 0 0 1 1-1h6.3c.4 0 .7.1 1 .4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="14.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 12l8.5-8.5M15.5 6l2.5 2.5M13 8.5L15 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16v10H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l16-8-6.5 16-2.8-7.2L4 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
