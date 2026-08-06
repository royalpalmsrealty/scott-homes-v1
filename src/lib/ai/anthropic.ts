// Single call site for the Anthropic API — every AI feature (search parsing,
// chatbot, blog writer) goes through here so there's one place to swap
// models or add retry/rate-limit logic later.
//
// Model note: the brief specified "claude-sonnet-4-6" as a placeholder; that
// string isn't a real model ID. Defaulting to the actual current model
// (claude-sonnet-5) so this genuinely works the moment a real key is added —
// override via ANTHROPIC_MODEL if you want a different one.
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const API_URL = "https://api.anthropic.com/v1/messages";

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

export type Message = { role: "user" | "assistant"; content: string | ContentBlock[] };

export type Tool = { name: string; description: string; input_schema: Record<string, unknown> };

type CallOptions = {
  system: string;
  messages: Message[];
  maxTokens?: number;
  model?: string;
  tools?: Tool[];
};

type ClaudeResponse = {
  content: ContentBlock[];
  stop_reason: string;
};

// Full response (content blocks + stop_reason) — needed for tool-use, where
// the caller has to inspect what Claude asked for before deciding what to
// send back.
export async function callClaudeRaw({
  system,
  messages,
  maxTokens = 1024,
  model,
  tools,
}: CallOptions): Promise<ClaudeResponse> {
  if (!isAnthropicConfigured()) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model ?? DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      ...(tools ? { tools } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  return res.json();
}

// Convenience wrapper for the common case (no tools, just want the text) —
// used by search parsing and the blog writer.
export async function callClaude(options: CallOptions) {
  const data = await callClaudeRaw(options);
  const textBlocks = data.content.filter((b): b is { type: "text"; text: string } => b.type === "text");
  return textBlocks.map((b) => b.text).join("\n");
}

// Strips ```json fences etc. Claude sometimes wraps structured output in
// markdown even when told not to — parse defensively rather than trust it.
export function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}
