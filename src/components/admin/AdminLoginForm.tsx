"use client";

import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Login failed.");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm border border-line bg-white p-8">
      <p className="font-display text-xl text-ink">Admin Sign-In</p>
      <p className="mt-2 font-sans text-sm text-muted">Royal Palms Realty content admin</p>
      <label htmlFor="admin-password" className="mt-6 block font-sans text-sm font-medium text-ink">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1.5 block w-full border border-line px-4 py-2.5 font-sans text-base text-ink focus:border-ink focus:outline-none"
        autoFocus
      />
      {error && <p className="mt-2 font-sans text-sm text-gold-deep">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex min-h-11 w-full items-center justify-center bg-ink font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
