import Image from "next/image";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import type { HeroMedia } from "@/lib/siteConfig";

// R9: single CMS-editable toggle (heroMedia.type) decides image vs video —
// no code path changes either way. The poster/image is always the LCP
// element regardless of which type is selected.
export function HeroBackground({ media }: { media: HeroMedia }) {
  if (media.type === "image") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={media.image}
          alt={media.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return <BackgroundVideo poster={media.poster} src={media.videoDesktop} priority />;
}
