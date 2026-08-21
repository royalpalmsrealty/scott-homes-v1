"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchFilterForm({
  initialQuery,
  initialNeighborhood,
  initialMinPrice,
  initialMaxPrice,
  initialMinBeds,
  initialCondo,
  initialWaterfront,
  neighborhoodOptions,
}: {
  initialQuery: string;
  initialNeighborhood: string | null;
  initialMinPrice: number | null;
  initialMaxPrice: number | null;
  initialMinBeds: number | null;
  initialCondo: boolean;
  initialWaterfront: boolean;
  neighborhoodOptions: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [neighborhood, setNeighborhood] = useState(initialNeighborhood ?? "");
  const [minPrice, setMinPrice] = useState(initialMinPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice?.toString() ?? "");
  const [minBeds, setMinBeds] = useState(initialMinBeds?.toString() ?? "");
  const [condo, setCondo] = useState(initialCondo);
  const [waterfront, setWaterfront] = useState(initialWaterfront);

  function runSearch() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minBeds) params.set("minBeds", minBeds);
    // Same param names the neighborhood pages already use for these two
    // toggles ("type"/"feature") — kept consistent site-wide.
    if (condo) params.set("type", "condo");
    if (waterfront) params.set("feature", "waterfront");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        runSearch();
      }}
      className="rounded-2xl border border-line bg-white p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for — e.g. 3 bed conch house in Old Town under $2M"
          aria-label="Search Key West listings in your own words"
          className="h-9 min-w-0 flex-1 border-none bg-transparent font-sans text-sm text-ink placeholder:text-body/70 focus:outline-none"
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Neighborhood</span>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
          >
            <option value="">Any</option>
            {neighborhoodOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Min Price</span>
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="No min"
            className="mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
        </label>

        <label className="block">
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Max Price</span>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="No max"
            className="mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
        </label>

        <label className="block">
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">Min Beds</span>
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            className="mt-1.5 block h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by property type or feature">
        <FilterChip label="Condo" active={condo} onClick={() => setCondo((c) => !c)} />
        <FilterChip label="Waterfront" active={waterfront} onClick={() => setWaterfront((w) => !w)} />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-11 min-w-32 items-center justify-center rounded-full bg-teal px-6 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
      >
        Search
      </button>
    </form>
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
