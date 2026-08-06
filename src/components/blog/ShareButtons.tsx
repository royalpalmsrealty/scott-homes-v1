"use client";

import { useEffect, useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  // Set after mount, not during render — window.location.href differs
  // between the server render (undefined) and the client, and embedding it
  // directly in href attributes during render caused a hydration mismatch.
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="mt-8 flex items-center gap-4 border-t border-line pt-6">
      <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted">
        Share
      </span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-sm text-teal-deep hover:underline"
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-sm text-teal-deep hover:underline"
      >
        X
      </a>
      <button type="button" onClick={handleCopy} className="font-sans text-sm text-teal-deep hover:underline">
        {copied ? "Link copied!" : "Copy Link"}
      </button>
    </div>
  );
}
