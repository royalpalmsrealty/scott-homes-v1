function slugifyHeading(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Renders the writer's minimal markdown convention: blank-line-separated
// paragraphs, "## " for H2 (anchored for the table of contents), "- " for
// list items. Anything else is a plain paragraph. [VERIFY: ...] markers are
// highlighted rather than silently rendered as normal text — a post
// shouldn't reach here with one still in it, but if it does, it should be
// obvious, not invisible.
export function BlogBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim());

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          const text = trimmed.slice(3).trim();
          return (
            <h2
              key={i}
              id={slugifyHeading(text)}
              className="mt-4 font-display text-2xl text-ink"
            >
              {text}
            </h2>
          );
        }

        if (trimmed.split("\n").every((line) => line.trim().startsWith("- "))) {
          const items = trimmed.split("\n").map((line) => line.trim().slice(2));
          return (
            <ul key={i} className="list-disc pl-6 font-sans text-base text-body">
              {items.map((item, j) => (
                <li key={j} className="mb-1.5">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="font-sans text-base leading-relaxed text-body">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\[VERIFY:[^\]]*\])/g);
  return parts.map((part, i) =>
    part.startsWith("[VERIFY:") ? (
      <span key={i} className="bg-gold/20 px-1 font-medium text-gold-deep">
        {part}
      </span>
    ) : (
      part
    )
  );
}
