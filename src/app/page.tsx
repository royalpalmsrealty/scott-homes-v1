import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { VideoTextPanel } from "@/components/media/VideoTextPanel";
import { CredentialsTicker } from "@/components/home/CredentialsTicker";
import { HomeValueSection } from "@/components/home/HomeValueSection";
import { MeetScottSection } from "@/components/home/MeetScottSection";
import { Testimonials } from "@/components/home/Testimonials";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { dummyListings } from "@/lib/dummyListings";

export default function Home() {
  return (
    <>
      {/* Hero — poster is the LCP element; video (if eligible) cross-fades in after (§7.1). */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden sm:min-h-[85vh]">
        <BackgroundVideo poster="/images/hero-poster.jpg" src="/video/hero.mp4" priority />
        {/* Uniform wash across the whole frame — no shape, just a modest across-
            the-board darkening. Legibility itself comes from the text-shadow
            on the text (.text-on-video), not from a panel behind it. */}
        <div className="absolute inset-0 bg-ink/28" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-3xl px-4 sm:px-6">
          <VideoTextPanel>
            <h1 className="text-on-video-teal font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Key West real estate, done quietly.
            </h1>
            <p className="text-on-video mt-4 max-w-xl font-sans text-base text-white/90 sm:text-lg">
              Serving Old Town, Casa Marina, Truman Annex, and every neighborhood in between.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center justify-center bg-white px-6 py-3 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                Search Key West Listings
              </Link>
              <Link
                href="/home-value"
                className="text-on-video inline-flex min-h-11 items-center justify-center border border-white px-6 py-3 font-sans text-sm font-medium text-white shadow-[0_2px_14px_rgba(0,0,0,0.45)] transition-colors hover:border-teal hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                What&rsquo;s My Home Worth?
              </Link>
            </div>
          </VideoTextPanel>
        </div>
      </section>

      <CredentialsTicker />

      {/* New listings — dummy data for layout only; live MLS feed lands in Phase 4/5 (§10). */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading eyebrow="Just Listed" heading="New in the Last 24 Hours" as="h2" />
        <p className="mt-6 max-w-2xl font-sans text-base text-body">
          Sample listings shown below — the live feed connects once the MLS layer (Phase 4)
          is wired up.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyListings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <HomeValueSection />

      <MeetScottSection />

      <Testimonials />
    </>
  );
}
