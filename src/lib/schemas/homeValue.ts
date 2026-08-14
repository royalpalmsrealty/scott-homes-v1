import { z } from "zod";

export const homeValueTimeframes = [
  { value: "just-curious", label: "Just Curious" },
  { value: "0-3-months", label: "0–3 Months" },
  { value: "3-6-months", label: "3–6 Months" },
  { value: "6-12-months", label: "6–12 Months" },
] as const;

export const HomeValueSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().min(5, "Enter the property address").max(300),
  timeframe: z.enum(["just-curious", "0-3-months", "3-6-months", "6-12-months"]),
  // Honeypot — see src/lib/schemas/contact.ts for why this stays permissive.
  company: z.string().max(200).optional().or(z.literal("")),
});

export type HomeValueInput = z.infer<typeof HomeValueSchema>;
