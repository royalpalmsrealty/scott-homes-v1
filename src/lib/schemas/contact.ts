import { z } from "zod";

export const contactReasons = [
  { value: "buying", label: "Buying" },
  { value: "selling", label: "Selling" },
  { value: "renting", label: "Renting" },
  { value: "general", label: "General Inquiry" },
] as const;

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),
  reason: z.enum(["buying", "selling", "renting", "general"]),
  message: z.string().trim().min(10, "Tell us a bit more (10 characters minimum)").max(5000),
  // Honeypot — real visitors never see or fill this field; bots often do. Must stay
  // valid (not rejected) when non-empty so the route can silently drop it instead
  // of bouncing the bot with a 400 that tips it off.
  company: z.string().max(200).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof ContactSchema>;
