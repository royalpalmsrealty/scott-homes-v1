import type { ToolDef } from "./toolTypes";

// Single call site for the OpenAI API — powers the chatbot. Built directly
// on the Responses API (not the older Chat Completions endpoint), because
// the document-upload/File Search feature only works through Responses —
// building on it now avoids a second migration later.
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const API_URL = "https://api.openai.com/v1/responses";

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export type FunctionCallItem = {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
};

export type FunctionCallOutputItem = {
  type: "function_call_output";
  call_id: string;
  output: string;
};

export type ResponsesInputItem =
  | { role: "user" | "assistant" | "system" | "developer"; content: string }
  | FunctionCallItem
  | FunctionCallOutputItem;

// Converts the shared {name, description, input_schema} shape into the
// Responses API's flat function-tool shape (name/description/parameters sit
// directly on the tool object, unlike Chat Completions' nested "function" wrapper).
function toOpenAITools(tools: ToolDef[]) {
  return tools.map((tool) => ({
    type: "function" as const,
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  }));
}

type CallOptions = {
  system: string;
  input: ResponsesInputItem[];
  maxOutputTokens?: number;
  model?: string;
  tools?: ToolDef[];
  /** Adds the built-in file_search tool against this vector store — separate
   * from `tools` since it's not one of our own function definitions; OpenAI
   * runs the retrieval itself and it never shows up as a function_call we
   * need to execute. */
  fileSearchVectorStoreId?: string;
};

type ResponseMessageItem = {
  type: "message";
  role: "assistant";
  content: Array<{ type: "output_text"; text: string } | { type: string; [key: string]: unknown }>;
};

type OpenAIResponse = {
  id: string;
  status: string;
  output: Array<ResponseMessageItem | FunctionCallItem>;
};

// Full response — needed for tool-use, where the caller has to scan `output`
// for function_call items before deciding what to send back. There's no
// stop_reason/finish_reason field on this API — "no function_call items
// present" is how you know the model is done and gave a final answer.
export async function callOpenAIRaw({
  system,
  input,
  maxOutputTokens = 1024,
  model,
  tools,
  fileSearchVectorStoreId,
}: CallOptions): Promise<OpenAIResponse> {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const allTools = [
    ...(tools ? toOpenAITools(tools) : []),
    ...(fileSearchVectorStoreId
      ? [{ type: "file_search" as const, vector_store_ids: [fileSearchVectorStoreId] }]
      : []),
  ];

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model ?? DEFAULT_MODEL,
      instructions: system,
      input,
      max_output_tokens: maxOutputTokens,
      ...(allTools.length > 0 ? { tools: allTools } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI API error ${res.status}: ${text}`);
  }

  return res.json();
}

// Convenience wrapper for the common case (no tools, just want the text) —
// used by the blog writer, which never needs function-calling or file search.
export async function callOpenAI(options: {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  model?: string;
}): Promise<string> {
  const response = await callOpenAIRaw({
    system: options.system,
    input: [{ role: "user", content: options.prompt }],
    maxOutputTokens: options.maxOutputTokens,
    model: options.model,
  });
  return extractFinalText(response);
}

export function extractFunctionCalls(response: OpenAIResponse): FunctionCallItem[] {
  return response.output.filter((item): item is FunctionCallItem => item.type === "function_call");
}

export function extractFinalText(response: OpenAIResponse): string {
  return response.output
    .filter((item): item is ResponseMessageItem => item.type === "message")
    .flatMap((item) =>
      item.content
        .filter((c): c is { type: "output_text"; text: string } => c.type === "output_text")
        .map((c) => c.text)
    )
    .join("\n");
}
