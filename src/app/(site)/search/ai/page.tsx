import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AISearchResults } from "@/components/search/AISearchResults";
import { parseSearchQuery } from "@/lib/ai/searchParser";
import { keywordSearchListings, filterListings } from "@/lib/listings/filterListings";
import { dummyListings } from "@/lib/dummyListings";
import { toListingFilters } from "@/lib/schemas/aiSearchFilters";

export const metadata: Metadata = {
  title: "Search Results",
  robots: { index: false }, // query-dependent page — not a canonical indexable URL
};

export default async function AISearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading eyebrow="Natural Language Search" heading="Search Results" as="h1" />
        <p className="mt-6 max-w-2xl font-sans text-base text-body">
          Try the search bar in the hero — describe what you&rsquo;re looking for in your own
          words, like &ldquo;3 bed conch house in Old Town under $2M.&rdquo;
        </p>
      </section>
    );
  }

  const { filters, usedFallback } = await parseSearchQuery(query);
  const initialResults = usedFallback
    ? keywordSearchListings(dummyListings, query)
    : filterListings(dummyListings, toListingFilters(filters));

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Natural Language Search" heading="Search Results" as="h1" />
      <div className="mt-8">
        <AISearchResults
          query={query}
          initialFilters={filters}
          initialResults={initialResults}
          usedFallback={usedFallback}
          allListings={dummyListings}
        />
      </div>
    </section>
  );
}
