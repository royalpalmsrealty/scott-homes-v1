import { VideoTextPanel } from "@/components/media/VideoTextPanel";
import { HeroBackground } from "@/components/home/HeroBackground";
import { HeroSearchInput } from "@/components/search/HeroSearchInput";
import { QuickSearchButtons } from "@/components/home/QuickSearchButtons";
import { CredentialsTicker } from "@/components/home/CredentialsTicker";
import { NeighborhoodTilesSection } from "@/components/home/NeighborhoodTilesSection";
import { LiveListingsSection } from "@/components/home/LiveListingsSection";
import { FeaturedVideoSection } from "@/components/home/FeaturedVideoSection";
import { HomeValueSection } from "@/components/home/HomeValueSection";
import { MeetScottSection } from "@/components/home/MeetScottSection";
import { Testimonials } from "@/components/home/Testimonials";
import { heroMedia } from "@/lib/siteConfig";

export default function Home() {
  return (
    <>
      {/* Hero — poster/image is always the LCP element regardless of the
          image/video toggle (R9); video (if eligible) cross-fades in after. */}
      {/* lg height accounts for the 80px sticky header (sm:h-20) — the header
          sits in normal flow above this section, so a plain 100vh here would
          push the hero's own vertical center below the fold and force a
          scroll to see the button row. */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden sm:min-h-[85vh] lg:min-h-[calc(100vh-80px)]">
        <HeroBackground media={heroMedia} />
        {/* Uniform wash across the whole frame — no shape, just a modest across-
            the-board darkening. Legibility itself comes from the text-shadow
            on the text (.text-on-video), not from a panel behind it. */}
        <div className="absolute inset-0 bg-ink/28" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6">
          <VideoTextPanel>
            <h1 className="text-on-video-teal font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Key West real estate, done quietly.
            </h1>
            <p className="text-on-video mt-4 max-w-xl font-sans text-base text-white/90 sm:text-lg">
              Serving Old Town, Casa Marina, Truman Annex, and every neighborhood in between.
            </p>
            {/* R2 — the primary search affordance now lives here. */}
            <div className="mt-8 w-full">
              <HeroSearchInput />
            </div>

            {/* R4 + R5 — same row, same start/end edges as the search bar above. */}
            <div className="mt-4 w-full">
              <QuickSearchButtons />
            </div>
          </VideoTextPanel>
        </div>
      </section>

      <CredentialsTicker />

      <NeighborhoodTilesSection />

      <LiveListingsSection />

      <FeaturedVideoSection />

      <HomeValueSection />

      <MeetScottSection />

      <Testimonials />
    </>
  );
}
