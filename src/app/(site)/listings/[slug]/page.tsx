import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { parseOwnListingSlug, fetchListingDetail } from "@/lib/listings/idxScrape";
import { ListingPhotoGallery } from "@/components/listings/ListingPhotoGallery";
import { ShareListingButton } from "@/components/listings/ShareListingButton";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { getNeighborhood } from "@/lib/neighborhoods";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic"; // always a live MLS lookup, never cached/prerendered

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

async function loadListing(slug: string) {
  const parsed = parseOwnListingSlug(slug);
  if (!parsed) return null;
  return fetchListingDetail(parsed.listingId, parsed.addressSlug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing) return {};

  return {
    title: `${listing.address}, ${listing.city}`,
    description: listing.description.slice(0, 160),
    robots: { index: false }, // live MLS data, not a canonical evergreen URL
    openGraph: listing.photos[0] ? { images: [listing.photos[0]] } : undefined,
  };
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const listing = await loadListing(slug);
  if (!listing) notFound();

  // Arrived from a neighborhood's listings page → send "Back" there instead
  // of the generic AI search, so the buyer lands where they were browsing.
  const fromNeighborhood = from ? getNeighborhood(from) : null;
  const backHref = fromNeighborhood ? `/neighborhoods/${fromNeighborhood.slug}` : "/search/ai";
  const backLabel = fromNeighborhood ? `Back to ${fromNeighborhood.name}` : "Back to Search";

  const mapsUrl =
    listing.lat && listing.lng ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}` : null;

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link href={backHref} className="inline-flex items-center gap-1.5 font-sans text-sm text-teal-deep hover:underline">
        &larr; {backLabel}
      </Link>

      <div className="mt-4">
        <ListingPhotoGallery photos={listing.photos} alt={`${listing.address}, ${listing.city}`} />
      </div>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1 font-sans text-xs font-medium text-teal-deep">
            {listing.status}
          </span>
          <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{formatPrice(listing.price)}</h1>
          <p className="mt-1 font-sans text-base text-body">
            {listing.address}, {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
        <ShareListingButton title={`${listing.address}, ${listing.city}`} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-5">
        {[
          { label: "Beds", value: listing.beds },
          { label: "Baths", value: listing.totalBaths },
          { label: "SqFt", value: listing.sqft?.toLocaleString() },
          { label: "Acres", value: listing.acres },
          { label: "Year Built", value: listing.yearBuilt },
        ].map(
          (stat) =>
            stat.value !== null &&
            stat.value !== undefined && (
              <div key={stat.label}>
                <p className="font-display text-2xl text-ink">{stat.value}</p>
                <p className="font-sans text-xs uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            )
        )}
      </div>

      {listing.description && (
        <div className="mt-8">
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-gold-deep">About This Home</p>
          <p className="mt-3 max-w-[70ch] font-sans text-base leading-relaxed text-body">{listing.description}</p>
        </div>
      )}

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-teal-deep hover:underline"
        >
          View on Google Maps &rarr;
        </a>
      )}

      <div className="mt-10 rounded-2xl border border-teal/30 bg-teal/10 p-6 text-center sm:p-8">
        <p className="font-display text-xl text-ink">Interested in this home?</p>
        <p className="mt-2 font-sans text-sm text-body">
          Reach out to {brand.broker.name} directly to schedule a showing or ask a question.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={brand.phone.href}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
          >
            Call {brand.phone.display}
          </a>
          <CalendlyButton
            utmContent="listing-detail-page"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-6 font-sans text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            Schedule a Showing
          </CalendlyButton>
        </div>
      </div>

      {listing.listedBy && (
        <p className="mt-8 font-sans text-xs text-muted">
          {listing.listedBy} — Listing ID {listing.listingId}. Data sourced from the Florida Keys MLS.
        </p>
      )}
    </section>
  );
}
