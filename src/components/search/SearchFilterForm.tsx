"use client";

import { useState, type ReactNode, type JSX } from "react";
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
  compact = false,
}: {
  initialQuery: string;
  initialNeighborhood: string | null;
  initialMinPrice: number | null;
  initialMaxPrice: number | null;
  initialMinBeds: number | null;
  initialCondo: boolean;
  initialWaterfront: boolean;
  neighborhoodOptions: string[];
  /** Drops the card's own padding/shadow/accent bar — for when it's already
   * sitting inside another card (e.g. floating over the search page's map
   * hero), so the two don't double up. */
  compact?: boolean;
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
      className={
        compact
          ? "relative"
          : "relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_30px_60px_-25px_rgba(15,40,38,0.35)] sm:p-8"
      }
    >
      {!compact && (
        <span
          className="absolute inset-x-0 top-0 h-[3px]"
          aria-hidden="true"
          style={{ background: "linear-gradient(90deg, var(--teal) 0%, var(--gold) 100%)" }}
        />
      )}

      <div className="flex items-center gap-3 rounded-full border border-line bg-paper px-5 py-2 transition-colors focus-within:border-teal/50 focus-within:ring-2 focus-within:ring-teal/20">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for — e.g. 3 bed conch house in Old Town under $2M"
          aria-label="Search Key West listings in your own words"
          className="h-10 min-w-0 flex-1 border-none bg-transparent font-sans text-[15px] text-ink placeholder:text-body/60 focus:outline-none"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Neighborhood" color="#35577a" icon={PinIcon}>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#35577a]/30"
          >
            <option value="">Any</option>
            {neighborhoodOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Min Price" color="#96802e" icon={DollarIcon}>
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="No min"
            className="h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#96802e]/30"
          />
        </FilterField>

        <FilterField label="Max Price" color="#c1694a" icon={DollarIcon}>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="No max"
            className="h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#c1694a]/30"
          />
        </FilterField>

        <FilterField label="Min Beds" color="#0f6e6b" icon={BedIcon}>
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-white px-3 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/40"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by property type or feature">
          <FilterChip label="Condo" active={condo} color="#c1694a" icon={HomeIcon} onClick={() => setCondo((c) => !c)} />
          <FilterChip label="Waterfront" active={waterfront} color="#35577a" icon={WaveIcon} onClick={() => setWaterfront((w) => !w)} />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--teal-deep)_100%)] px-7 font-sans text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(15,110,107,0.55)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}

function FilterField({
  label,
  color,
  icon: Icon,
  children,
}: {
  label: string;
  color: string;
  icon: () => JSX.Element;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Icon />
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function FilterChip({
  label,
  active,
  color,
  icon: Icon,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  icon: () => JSX.Element;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 font-sans text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
      style={
        active
          ? { borderColor: color, backgroundColor: color, color: "#fff", boxShadow: `0 4px 14px -2px ${color}80` }
          : { borderColor: "var(--line)", backgroundColor: "#fff", color: "var(--body)" }
      }
    >
      <Icon />
      {label}
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v18M16.5 7c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3c0 4 9 2.3 9 6.3 0 1.7-2 3-4.5 3s-4.5-1.3-4.5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 19v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 19v2M21 19v2M3 13V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v4M13 11V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11 12 4l8 7M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 11c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
