import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoLightbox } from "@/components/media/VideoLightbox";
import { featuredVideos } from "@/lib/featuredVideos";

export function FeaturedVideoSection() {
  const [hero, ...rest] = featuredVideos;
  if (!hero) return null;

  return (
    <section className="bg-paper py-14 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Watch" heading="Featured Video" as="h2" />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <VideoLightbox video={hero} className="aspect-video lg:col-span-2" />
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
            {rest.map((video, i) => (
              <VideoLightbox key={i} video={video} className="aspect-video" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
