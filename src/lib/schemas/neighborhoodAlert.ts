import { z } from "zod";

export const NeighborhoodAlertSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(200),
  email: z.string().trim().email("Enter a valid email address"),
  neighborhoodSlug: z.string().trim().min(1).max(100),
  neighborhoodName: z.string().trim().min(1).max(100),
  // Honeypot — see src/lib/schemas/contact.ts for why this stays permissive.
  company: z.string().max(200).optional().or(z.literal("")),
});

export type NeighborhoodAlertInput = z.infer<typeof NeighborhoodAlertSchema>;
