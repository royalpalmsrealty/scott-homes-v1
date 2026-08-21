import { z } from "zod";

// One optional sub-schema per step of the Make an Offer flow — the whole
// object is sent on every PATCH, but only the current step's fields are
// ever populated, since steps save incrementally as the buyer moves through
// them. Numeric/date/legal fields are always real typed values here, never
// free text for the AI to parse — see the offer flow's own guardrail notes.
export const OfferPatchSchema = z.object({
  buyerName: z.string().trim().min(2).max(200).optional(),
  buyerEmail: z.string().trim().email().optional(),
  buyerPhone: z.string().trim().max(30).optional(),

  offerPrice: z.number().positive().max(500_000_000).optional(),

  escrowAmount: z.number().nonnegative().optional(),
  escrowPercent: z.number().min(0).max(100).optional(),

  financing: z.enum(["cash", "financed"]).optional(),

  inspectionDays: z.number().int().min(0).max(90).optional(),
  inspectionReminderShown: z.literal(true).optional(),

  titleCostsNote: z.string().trim().max(2000).optional(),

  closingDate: z.string().trim().date().optional(),

  specialClauses: z.string().trim().max(4000).optional(),
  saleOfPropertyNotes: z.string().trim().max(4000).optional(),

  personalProperty: z.string().trim().max(2000).optional(),

  titleTakenAs: z.string().trim().max(500).optional(),
});
export type OfferPatchInput = z.infer<typeof OfferPatchSchema>;

export const CreateOfferSchema = z.object({
  listingId: z.string().trim().min(1),
  addressSlug: z.string().trim().min(1),
});
export type CreateOfferInput = z.infer<typeof CreateOfferSchema>;

export const EscalateOfferSchema = z.object({
  callbackPhone: z.string().trim().min(7).max(30),
  callbackBestTime: z.string().trim().max(200).optional(),
  // Honeypot — see ContactSchema for why this must stay valid (not rejected)
  // when non-empty rather than bouncing the bot with a 400.
  company: z.string().max(200).optional().or(z.literal("")),
});
export type EscalateOfferInput = z.infer<typeof EscalateOfferSchema>;

export const UploadDocumentKindSchema = z.enum([
  "photo_id",
  "proof_of_funds",
  "preapproval",
  "contingency",
]);
export type UploadDocumentKind = z.infer<typeof UploadDocumentKindSchema>;
