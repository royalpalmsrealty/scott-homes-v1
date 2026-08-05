import { social } from "@/lib/brand";
import { FacebookIcon, LinkedInIcon, YouTubeIcon, TikTokIcon } from "./SocialIcons";

const links = [
  { label: "Facebook", href: social.facebook, Icon: FacebookIcon },
  { label: "LinkedIn", href: social.linkedin, Icon: LinkedInIcon },
  { label: "YouTube", href: social.youtube, Icon: YouTubeIcon },
  { label: "TikTok", href: social.tiktok, Icon: TikTokIcon },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} (opens in a new tab)`}
          className="flex h-9 w-9 items-center justify-center border border-line text-body transition-colors hover:border-teal-deep hover:text-teal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
