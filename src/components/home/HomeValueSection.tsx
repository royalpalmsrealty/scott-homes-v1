import Link from "next/link";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { VideoTextPanel } from "@/components/media/VideoTextPanel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { brand } from "@/lib/brand";

export function HomeValueSection() {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden sm:min-h-[70vh]">
      <BackgroundVideo poster="/images/home-tour-poster.jpg" src="/video/home-tour-web.mp4" />
      {/* Uniform wash, no shape — legibility comes from text-shadow on the
          text itself (.text-on-video), not a panel behind it. */}
      <div className="absolute inset-0 bg-ink/28" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-2xl px-4 sm:px-6">
        <VideoTextPanel>
          <SectionHeading
            eyebrow="Know Your Number"
            heading="What Is Your Home Worth Today?"
            as="h2"
            align="center"
            tone="white"
            shadow
          />
          <p className="text-on-video mt-6 max-w-lg font-sans text-base text-white/90 sm:text-lg">
            Key West&rsquo;s market moves fast. Get an accurate, data-driven valuation based
            on current comparable sales and neighborhood-specific trends — no obligation,
            no pressure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href="/home-value"
              event="valuation_cta_click"
              params={{ location: "homepage-band" }}
              className="inline-flex min-h-11 items-center justify-center bg-white px-6 py-3 font-sans text-sm font-medium text-ink transition-colors hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
            >
              What&rsquo;s My Home Worth?
            </TrackedLink>
            <Link
              href="/contact"
              className="text-on-video inline-flex min-h-11 items-center justify-center border border-white px-6 py-3 font-sans text-sm font-medium text-white shadow-[0_2px_14px_rgba(0,0,0,0.45)] transition-colors hover:border-teal hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
            >
              Talk to {brand.broker.name.split(" ")[0]}
            </Link>
          </div>
        </VideoTextPanel>
      </div>
    </section>
  );
}
