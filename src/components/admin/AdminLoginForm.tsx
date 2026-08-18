"use client";

import { useState, type FormEvent } from "react";
import { AdminLogo } from "./AdminLogo";

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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10"
    >
      <AdminLogo size={64} />

      <p className="mt-5 font-display text-2xl text-white">Admin Sign-In</p>
      <p className="mt-1.5 font-sans text-sm text-white/50">Royal Palms Realty content admin</p>

      <label htmlFor="admin-password" className="mt-7 block font-sans text-xs font-medium uppercase tracking-wide text-white/60">
        Password
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 transition-colors focus-within:border-teal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/40">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent font-sans text-sm text-white placeholder:text-white/30 focus:outline-none"
          placeholder="Enter password"
          autoFocus
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 font-sans text-sm text-gold">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-6 font-sans text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
