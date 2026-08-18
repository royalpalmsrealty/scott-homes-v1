import { brand, socialPlatforms } from "@/lib/brand";
import { InstagramIcon, FacebookIcon, LinkedInIcon, YouTubeIcon } from "./SocialIcons";

const iconByKey = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
} as const;

// R11: exactly one icon per confirmed platform. An empty URL means the icon
// doesn't render at all — a link to an account that doesn't exist yet reads
// as careless, and not all four are confirmed live.
export function SocialLinks({ className = "" }: { className?: string }) {
  const confirmed = socialPlatforms.filter((p) => p.url);
  if (confirmed.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {confirmed.map(({ key, label, url }) => {
        const Icon = iconByKey[key];
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${brand.brokerage} on ${label}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/25 bg-teal/10 text-teal-deep shadow-sm transition-colors hover:border-teal hover:bg-teal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
