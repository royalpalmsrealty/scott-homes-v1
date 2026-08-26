import Link from "next/link";

type ListingsPaginationProps = {
  currentPage: number;
  totalPages: number;
  // The current URL's query params, already excluding "page" — spread back
  // onto each page link so filters/search terms survive pagination.
  baseParams: Record<string, string>;
  basePath: string;
};

function hrefForPage(basePath: string, baseParams: Record<string, string>, page: number) {
  const params = new URLSearchParams(baseParams);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function ListingsPagination({ currentPage, totalPages, baseParams, basePath }: ListingsPaginationProps) {
  if (totalPages <= 1) return null;

  // Keeps the link row short even at IDX's own ~21-page ceiling (500
  // results / 24 per page) — always show first/last plus a window around
  // the current page, with a gap marker where numbers are skipped.
  const pages = new Set<number>([1, totalPages]);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  return (
    <nav aria-label="Listings pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={hrefForPage(basePath, baseParams, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`inline-flex min-h-11 items-center rounded-full border px-4 font-sans text-sm transition-colors ${
          currentPage === 1
            ? "pointer-events-none border-line text-muted/50"
            : "border-line text-body hover:border-teal-deep hover:text-teal-deep"
        }`}
      >
        &larr; Prev
      </Link>

      {sorted.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - sorted[i - 1] > 1 && <span className="px-1 font-sans text-sm text-muted">&hellip;</span>}
          <Link
            href={hrefForPage(basePath, baseParams, p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border font-sans text-sm transition-colors ${
              p === currentPage
                ? "border-ink bg-ink text-white"
                : "border-line text-body hover:border-teal-deep hover:text-teal-deep"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={hrefForPage(basePath, baseParams, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex min-h-11 items-center rounded-full border px-4 font-sans text-sm transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none border-line text-muted/50"
            : "border-line text-body hover:border-teal-deep hover:text-teal-deep"
        }`}
      >
        Next &rarr;
      </Link>
    </nav>
  );
}
