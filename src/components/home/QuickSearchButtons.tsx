import Link from "next/link";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";

const BUTTONS = [
  { href: "/search/new-24-hours", label: "New in the Last 24 Hours", icon: <ClockIcon /> },
  { href: "/search/new-7-days", label: "New in the Last 7 Days", icon: <CalendarDaysIcon /> },
];

export function QuickSearchButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {BUTTONS.map((button) => (
        <Link
          key={button.href}
          href={button.href}
          className="group flex h-10 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/60 bg-white/55 px-4 font-sans text-sm font-medium text-ink shadow-[0_4px_18px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/70 hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal/25 text-teal-deep transition-colors duration-200 group-hover:bg-teal group-hover:text-ink">
            {button.icon}
          </span>
          {button.label}
        </Link>
      ))}

      {/* R5 — same row, same width as the two data buttons beside it. */}
      <CalendlyButton
        utmContent="hero_row"
        className="group flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/60 bg-teal/80 px-4 font-sans text-sm font-medium text-ink shadow-[0_4px_18px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:scale-110"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Book a Call
      </CalendlyButton>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarDaysIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 14h2M8 17h2M14 14h2M14 17h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
