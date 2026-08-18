// Provider-agnostic tool definition. chatTools.ts describes each tool once
// in this shape; anthropic.ts and mistral.ts each convert it to their own
// API's tool format at the call site — so which provider is actually
// answering the chatbot can change without touching the tool definitions.
export type ToolDef = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};
