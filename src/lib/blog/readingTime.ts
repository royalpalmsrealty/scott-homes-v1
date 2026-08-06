const WORDS_PER_MINUTE = 220;

export function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

export function extractH2Headings(body: string): string[] {
  return body
    .split("\n")
    .filter((line) => line.trim().startsWith("## "))
    .map((line) => line.trim().slice(3).trim());
}
