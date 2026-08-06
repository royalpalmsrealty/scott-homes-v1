import { z } from "zod";

export const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(40), // caps conversation length sent per request — keeps token cost bounded
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
