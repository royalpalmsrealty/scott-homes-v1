import { NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/schemas/chat";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  isOpenAIConfigured,
  callOpenAIRaw,
  extractFunctionCalls,
  extractFinalText,
  type ResponsesInputItem,
} from "@/lib/ai/openai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/chatSystemPrompt";
import { CHAT_TOOLS, executeChatTool, type ClientAction } from "@/lib/ai/chatTools";
import { getVectorStoreId } from "@/lib/ai/knowledgeBase";
import { brand } from "@/lib/brand";

const MAX_TOOL_ROUNDTRIPS = 4;

const OFFLINE_REPLY = `I'm not available yet while our AI assistant is being set up. In the meantime, call ${brand.broker.name} directly at ${brand.phone.display}, or use the contact form and he'll get back to you personally.`;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`chat:${ip}`, 20, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down a bit." },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isOpenAIConfigured()) {
    // Dummy-key-safe fallback — never a broken or silent chat window.
    return NextResponse.json({ reply: OFFLINE_REPLY, clientActions: [], disabled: true });
  }

  const input: ResponsesInputItem[] = parsed.data.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const clientActions: ClientAction[] = [];
  let finalText = "";

  // Only added once documents actually exist to search — otherwise the tool
  // list stays exactly as it was before the knowledge base existed.
  const vectorStoreId = (await getVectorStoreId()) ?? undefined;

  try {
    for (let i = 0; i < MAX_TOOL_ROUNDTRIPS; i++) {
      const data = await callOpenAIRaw({
        system: CHAT_SYSTEM_PROMPT,
        input,
        tools: CHAT_TOOLS,
        fileSearchVectorStoreId: vectorStoreId,
        maxOutputTokens: 800,
      });

      const functionCalls = extractFunctionCalls(data);

      if (functionCalls.length === 0) {
        finalText = extractFinalText(data);
        break;
      }

      // Echo the model's own function_call items back before the results —
      // the Responses API needs both, matched by call_id, on the next turn.
      input.push(...functionCalls);

      for (const call of functionCalls) {
        const callInput = JSON.parse(call.arguments || "{}");
        const { result, clientAction } = await executeChatTool(call.name, callInput);
        if (clientAction) clientActions.push(clientAction);
        input.push({
          type: "function_call_output",
          call_id: call.call_id,
          output: JSON.stringify(result),
        });
      }
    }
  } catch (error) {
    console.error("Chat request failed", error);
    return NextResponse.json({
      reply: `Something went wrong on my end. Call ${brand.broker.name} directly at ${brand.phone.display}, or try again in a moment.`,
      clientActions: [],
      disabled: false,
    });
  }

  return NextResponse.json({
    reply: finalText || "Sorry, I didn't quite catch that — could you rephrase?",
    clientActions,
    disabled: false,
  });
}
