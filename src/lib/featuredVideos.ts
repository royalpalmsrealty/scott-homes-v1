// R12: platform-agnostic by design — switching a video (or the whole
// section) from YouTube to Vimeo later is a data change here, not a rebuild.
// TODO-CLIENT-ASSET: no real footage yet. videoId below is a well-known,
// stable public placeholder used only to prove the click-to-embed lightbox
// mechanism works end-to-end; isPlaceholder gates the "Sample" badge so it's
// never mistaken for real content.
export type FeaturedVideo = {
  platform: "youtube" | "vimeo";
  videoId: string;
  title: string;
  duration: string;
  isPlaceholder?: boolean;
};

export const featuredVideos: FeaturedVideo[] = [
  {
    platform: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Old Town Property Tour",
    duration: "2:14",
    isPlaceholder: true,
  },
  {
    platform: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Casa Marina Beachfront Walkthrough",
    duration: "1:48",
    isPlaceholder: true,
  },
  {
    platform: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Meet Scott Forman",
    duration: "1:05",
    isPlaceholder: true,
  },
  {
    platform: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Key West Market Update",
    duration: "3:02",
    isPlaceholder: true,
  },
];
