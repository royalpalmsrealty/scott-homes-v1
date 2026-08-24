import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { parseOwnListingSlug, fetchListingDetail } from "@/lib/listings/idxScrape";
import { ListingPhotoGallery } from "@/components/listings/ListingPhotoGallery";
import { ShareListingButton } from "@/components/listings/ShareListingButton";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
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

const STATUS_TONE: Record<string, string> = {
  Active: "bg-teal/15 text-teal-deep",
  "Active Under Contract": "bg-gold/20 text-gold-deep",
  Pending: "bg-gold/20 text-gold-deep",
  Sold: "bg-line text-body",
};

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; fromLabel?: string }>;
}) {
  const { slug } = await params;
  const { from, fromLabel } = await searchParams;
  const listing = await loadListing(slug);
  if (!listing) notFound();

  // "from" is whatever page linked here (a neighborhood, /search with its
  // filters, an AI search) — sending "Back" there instead of a generic
  // dead-end. Only ever a same-site relative path we generated ourselves;
  // reject anything else (e.g. an absolute/external URL) before using it.
  const backHref = from && from.startsWith("/") ? from : "/";
  const backLabel = from && fromLabel ? fromLabel : "Back to Home";

  const mapsUrl =
    listing.lat && listing.lng ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}` : null;
  const statusTone = STATUS_TONE[listing.status] ?? "bg-teal/15 text-teal-deep";
  // A sold home can't be shown or offered on — the CTA panel reflects that
  // instead of inviting an offer on something that's already off the market.
  const isSold = listing.status === "Sold";

  const stats = [
    { label: "Beds", value: listing.beds, color: "#0f6e6b", icon: BedIcon },
    { label: "Baths", value: listing.totalBaths, color: "#96802e", icon: BathIcon },
    { label: "SqFt", value: listing.sqft?.toLocaleString(), color: "#c1694a", icon: RulerIcon },
    { label: "Acres", value: listing.acres, color: "#5b7f5e", icon: LeafIcon },
    { label: "Year Built", value: listing.yearBuilt, color: "#35577a", icon: CalendarIcon },
  ].filter((s) => s.value !== null && s.value !== undefined);

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link href={backHref} className="inline-flex items-center gap-1.5 font-sans text-sm text-teal-deep hover:underline">
        &larr; {backLabel}
      </Link>

      <div className="mt-4">
        <ListingPhotoGallery photos={listing.photos} alt={`${listing.address}, ${listing.city}`} />
      </div>

      <div className="mt-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wide ${statusTone}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {listing.status}
          </span>
          {isSold && (
            <p className="mt-3 font-sans text-xs font-medium uppercase tracking-wide text-muted">Sold For</p>
          )}
          <h1 className="mt-4 font-display text-4xl leading-none text-ink sm:text-5xl">
            {formatPrice(listing.price)}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 font-sans text-base text-body">
            <PinIcon />
            {listing.address}, {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
        <ShareListingButton title={`${listing.address}, ${listing.city}`} />
      </div>

      {stats.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.25)]"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${stat.color}1a`, color: stat.color }}
                >
                  <Icon />
                </span>
                <p
                  className="mt-3 font-display text-2xl leading-none"
                  style={{ color: stat.color, fontVariantNumeric: "tabular-nums" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 font-sans text-xs font-medium uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          {listing.description && (
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(165deg,var(--paper)_0%,#fff_60%)] p-7 sm:p-9">
              <span
                className="absolute -left-2 -top-6 font-display text-[7rem] leading-none text-teal/10 select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="relative font-sans text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                About This Home
              </p>
              <p className="relative mt-4 max-w-[66ch] font-sans text-[17px] leading-[1.8] text-body [&::first-letter]:mr-1 [&::first-letter]:float-left [&::first-letter]:font-display [&::first-letter]:text-6xl [&::first-letter]:leading-[0.8] [&::first-letter]:text-teal-deep">
                {listing.description}
              </p>
            </div>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-sans text-sm font-medium text-ink transition-colors hover:border-teal/50 hover:bg-teal/5"
            >
              <GoogleMapsIcon />
              View on Google Maps
            </a>
          )}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-line shadow-[0_20px_45px_-25px_rgba(0,0,0,0.4)] lg:sticky lg:top-24 lg:self-start">
          {listing.photos[0] && (
            <div className="absolute inset-0">
              <Image src={listing.photos[0]} alt="" fill sizes="320px" className="object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.72) 10%, rgba(15,110,107,0.82) 100%)" }}
                aria-hidden="true"
              />
            </div>
          )}
          <div className="relative p-6 sm:p-7">
            {isSold ? (
              <>
                <p className="font-display text-xl text-white">This home has sold</p>
                <p className="mt-2 font-sans text-sm text-white/80">
                  Looking for something similar? Reach out to {brand.broker.name} directly.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/search"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-5 font-sans text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
                  >
                    Search Active Listings
                  </Link>
                  <a
                    href={brand.phone.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 px-5 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Call {brand.phone.display}
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="font-display text-xl text-white">Interested in this home?</p>
                <p className="mt-2 font-sans text-sm text-white/80">
                  Reach out to {brand.broker.name} directly to schedule a showing or ask a question.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <CalendlyButton
                    utmContent="listing-detail-page"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] px-5 font-sans text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
                  >
                    Schedule a Showing
                  </CalendlyButton>
                  <Link
                    href={`/listings/${slug}/offer`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 font-sans text-sm font-semibold text-ink transition-colors hover:bg-white/90"
                  >
                    Make an Offer
                  </Link>
                  <a
                    href={brand.phone.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 px-5 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Call {brand.phone.display}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {listing.listedBy && (
        <p className="mt-12 border-t border-line pt-6 font-sans text-xs text-muted">
          {listing.listedBy} — Listing ID {listing.listingId}. Data sourced from the Florida Keys MLS.
        </p>
      )}
    </section>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-muted">
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

// The standard Google Maps pin mark, as used on Google's own "Open in Maps" links.
function GoogleMapsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M24 4C15.7 4 9 10.7 9 19c0 10.5 12.4 22.6 14.2 24.3.5.5 1.3.5 1.8 0C26.8 41.6 39 29.5 39 19c0-8.3-6.7-15-15-15z"
        fill="#EA4335"
      />
      <circle cx="24" cy="19" r="6.5" fill="#fff" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 19v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 19v2M21 19v2M3 13V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v4M13 11V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM4 12V6a2 2 0 0 1 2-2c1 0 1.6.6 1.9 1.3M6 19v2M18 19v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="18" height="8" rx="1.5" transform="rotate(-45 12 12)" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 9.5 11 11M12.5 6.5 14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4c-9 0-16 7-16 16 9 0 16-7 16-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M6 18 18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
