// The model replies with a fuller markdown subset than the blog writer does
// (bold, headings, horizontal rules, numbered/bulleted lists) — this renders
// that instead of dumping raw "**bold**" / "- item" syntax as literal text.
//
// Groups line-by-line rather than by blank-line blocks, because the model
// routinely writes a lead-in sentence immediately followed by a list with no
// blank line in between — a blank-line splitter would lump both into one
// unrendered paragraph.
type Block =
  | { type: "heading"; text: string }
  | { type: "hr" }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      blocks.push({ type: "p", text: paragraphLines.join(" ") });
      paragraphLines = [];
    }
  }

  function flushList() {
    if (listItems.length > 0 && listType) {
      blocks.push({ type: listType, items: listItems });
      listItems = [];
      listType = null;
    }
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: headingMatch[1] });
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(bulletMatch[1]);
      continue;
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.*)/);
    if (numberedMatch) {
      flushParagraph();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(numberedMatch[1]);
      continue;
    }

    // Plain text line — ends whatever list was running, joins the paragraph.
    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

export function ChatMarkdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, i) => {
        if (block.type === "hr") return <hr key={i} className="my-1 border-line/60" />;

        if (block.type === "heading") {
          return (
            <p key={i} className="font-sans text-sm font-semibold text-ink">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={i} className="flex flex-col gap-1 pl-4">
              {block.items.map((item, j) => (
                <li key={j} className="list-disc leading-snug">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={i} className="flex flex-col gap-1 pl-4">
              {block.items.map((item, j) => (
                <li key={j} className="list-decimal leading-snug">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="leading-relaxed">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

// Handles **bold** only — the one inline style the model actually reaches
// for. Deliberately not a general markdown parser.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
