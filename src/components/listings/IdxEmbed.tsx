"use client";

// Embeds an IDX Broker results-style page (search results, sold/pending)
// directly, instead of our server fetching and re-rendering it. The
// visitor's own browser talks to IDX Broker here, not our server — that's
// what avoids IDX Broker's bot protection blocking our server's old scraping
// requests (see idxScrape.ts's migration note).
//
// Scoped deliberately to results-grid views, not individual listing details:
// the URLs this renders (buildIdxSearchUrl, SOLD_PENDING_URL) already have
// ?nowrapper=1 applied, which we've confirmed strips IDX Broker's own
// sidebar/wrapper cleanly for these — but IDX Broker's own internal links
// (e.g. clicking one listing to see its full Details page) don't carry that
// fix, and clicking inside an iframe never changes the browser's address
// bar. That's an accepted, smaller trade-off (their sidebar reappears, and
// there's no unique URL, only once someone drills into one specific
// listing) — better than showing no listings at all on this page.
export function IdxEmbed({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      className="w-full min-h-[900px] border-0"
      loading="lazy"
    />
  );
}
