import { NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/schemas/chat";
import { checkRateLimit } from "@/lib/rateLimit";
import { isAnthropicConfigured, callClaudeRaw, type Message } from "@/lib/ai/anthropic";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/chatSystemPrompt";
import { CHAT_TOOLS, executeChatTool, type ClientAction } from "@/lib/ai/chatTools";
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

  if (!isAnthropicConfigured()) {
    // Dummy-key-safe fallback — never a broken or silent chat window.
    return NextResponse.json({ reply: OFFLINE_REPLY, clientActions: [], disabled: true });
  }

  const messages: Message[] = parsed.data.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const clientActions: ClientAction[] = [];
  let finalText = "";

  try {
    for (let i = 0; i < MAX_TOOL_ROUNDTRIPS; i++) {
      const data = await callClaudeRaw({
        system: CHAT_SYSTEM_PROMPT,
        messages,
        tools: CHAT_TOOLS,
        maxTokens: 800,
      });

      const toolUseBlocks = data.content.filter((b) => b.type === "tool_use");

      if (data.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
        finalText = data.content
          .filter((b): b is { type: "text"; text: string } => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        break;
      }

      messages.push({ role: "assistant", content: data.content });

      const resultBlocks = [];
      for (const block of toolUseBlocks) {
        if (block.type !== "tool_use") continue;
        const { result, clientAction } = await executeChatTool(block.name, block.input);
        if (clientAction) clientActions.push(clientAction);
        resultBlocks.push({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
      messages.push({ role: "user", content: resultBlocks });
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
