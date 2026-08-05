"use client";

import { useId, useState, type FormEvent } from "react";
import { NeighborhoodAlertSchema } from "@/lib/schemas/neighborhoodAlert";

type Status = "idle" | "submitting" | "success" | "error";

export function NeighborhoodAlertForm({
  neighborhoodSlug,
  neighborhoodName,
}: {
  neighborhoodSlug: string;
  neighborhoodName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const formId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = NeighborhoodAlertSchema.safeParse({
      name,
      email,
      company,
      neighborhoodSlug,
      neighborhoodName,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setError(null);
    setStatus("submitting");

    try {
      const res = await fetch("/api/neighborhood-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("submit-failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="font-sans text-sm font-medium text-teal-deep">
        You&rsquo;re on the list — we&rsquo;ll email you when new {neighborhoodName} listings
        hit the market.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-company`}>Company</label>
        <input
          id={`${formId}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="flex-1">
        <label htmlFor={`${formId}-name`} className="sr-only">
          Full Name
        </label>
        <input
          id={`${formId}-name`}
          type="text"
          placeholder="Full name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full border border-line bg-white px-4 py-2.5 font-sans text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
        />
      </div>
      <div className="flex-1">
        <label htmlFor={`${formId}-email`} className="sr-only">
          Email
        </label>
        <input
          id={`${formId}-email`}
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full border border-line bg-white px-4 py-2.5 font-sans text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Signing Up…" : "Get Listing Alerts"}
      </button>

      {status === "error" && (
        <p role="alert" className="font-sans text-sm text-gold-deep sm:basis-full">
          Something went wrong. Please try again.
        </p>
      )}
      {error && (
        <p role="alert" className="font-sans text-sm text-gold-deep sm:basis-full">
          {error}
        </p>
      )}
    </form>
  );
}
