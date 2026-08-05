import { brand } from "@/lib/brand";

// Highest-converting element on realtor sites, per the brief — always present on mobile.
export function MobileStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white lg:hidden">
      <a
        href={brand.phone.href}
        className="flex min-h-14 flex-1 items-center justify-center gap-2 border-r border-line font-sans text-sm font-medium text-ink"
      >
        <PhoneIcon />
        Call {brand.broker.name.split(" ")[0]}
      </a>
      <a
        href="/search"
        className="flex min-h-14 flex-1 items-center justify-center gap-2 bg-ink font-sans text-sm font-medium text-white"
      >
        <SearchIcon />
        Search Listings
      </a>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8C8.1 13.8 10.2 15.9 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.5 21.4 2.6 13.5 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L15.8 15.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
