import Image from "next/image";
import { brand } from "@/lib/brand";

// The source file (public/brand/logo.jpg) is baked onto a white background,
// not transparent — wrapping it in its own white plate turns that into a
// deliberate badge instead of a stray white box on the dark admin chrome.
export function AdminLogo({ size = 44 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
      style={{ width: size, height: size, padding: size * 0.14 }}
    >
      <Image
        src="/brand/logo.jpg"
        alt={brand.brokerage}
        width={207}
        height={154}
        className="h-full w-auto object-contain"
      />
    </span>
  );
}
