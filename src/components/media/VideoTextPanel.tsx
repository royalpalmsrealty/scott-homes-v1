import type { ReactNode } from "react";

// No background shape at all — even a soft radial glow still reads as a
// "panel" sitting on top of the video. Legibility comes entirely from
// text-shadow on the text itself (see the [text-shadow:...] utility used on
// each heading/paragraph), which hugs the letterforms instead of a box.
export function VideoTextPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-16">
      {children}
    </div>
  );
}
