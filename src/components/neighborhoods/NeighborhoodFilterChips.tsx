"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function NeighborhoodFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const condoActive = searchParams.get("type") === "condo";
  const waterfrontActive = searchParams.get("feature") === "waterfront";
  const anyActive = condoActive || waterfrontActive;

  function toggle(key: "type" | "feature", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("feature");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by property type or feature">
      <FilterChip
        label="Condo"
        active={condoActive}
        onClick={() => toggle("type", "condo")}
      />
      <FilterChip
        label="Waterfront"
        active={waterfrontActive}
        onClick={() => toggle("feature", "waterfront")}
      />
      {anyActive && (
        <button
          type="button"
          onClick={clearAll}
          className="font-sans text-xs font-medium text-muted underline hover:text-ink"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 font-sans text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep ${
        active
          ? "border-teal bg-teal text-ink shadow-[0_4px_14px_rgba(40,188,184,0.35)]"
          : "border-line bg-white text-body hover:border-teal/50 hover:bg-teal/5"
      }`}
    >
      {active && <CheckIcon />}
      {label}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
