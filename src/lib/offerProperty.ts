import { z } from "zod";

const text = z.string().trim().min(1).max(500);
// A source-provided link, never a URL invented from the MLS number.
export const MlsUrlSchema = z.url().max(2000).refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password &&
    (url.hostname === "flexmls.com" || url.hostname.endsWith(".flexmls.com"));
}, "A source-provided FlexMLS link is required.");
export const MlsPropertySchema = z.object({
  source: z.literal("FlexMLS"), listingKey: text, listingId: text, mlsId: text,
  mlsUrl: MlsUrlSchema, address: text, status: text,
  listPrice: z.number().nonnegative().nullable(),
  retrievedAt: z.iso.datetime(),
  publicDisplayAllowed: z.literal(true),
  listingAgent: z.object({ name: text.nullable(), id: text.nullable(), email: z.email().nullable(), phone: text.nullable() }).strict(),
  listingOffice: z.object({ name: text.nullable(), id: text.nullable(), phone: text.nullable() }).strict(),
  propertyDetails: z.record(z.string(), z.json()),
  sourceRecord: z.record(z.string(), z.json()),
}).strict();
export type MlsProperty = z.infer<typeof MlsPropertySchema>;
export type PropertyCandidate = Pick<MlsProperty, "listingId" | "address" | "status" | "listPrice"> & { selection: string; listedBy: string | null };
export type PropertyLookupResult = { state: "matched" | "choices" | "not_connected" | "unavailable" | "not_found"; candidates: PropertyCandidate[] };

export function propertyLookupMessage(state: PropertyLookupResult["state"] | undefined): string {
  if (state === "not_connected") return "Your address is saved. MLS lookup is not connected yet, so no listing details were retrieved.";
  if (state === "not_found") return "Your address is saved, but the MLS search returned no matching listing. You can add a unit or MLS number, or continue with this address.";
  if (state === "unavailable") return "Your address is saved. MLS lookup could not retrieve listing details. You can try again or continue.";
  return "Your address will be included with your request. No MLS record is attached yet.";
}

export function publicPropertyCandidate(record: MlsProperty, selection: string): PropertyCandidate {
  // Never send broker-only records, agent contact data or the private MLS link to the buyer/voice service.
  return { listingId: record.listingId, address: record.address, status: record.status, listPrice: record.listPrice, selection, listedBy: record.listingOffice.name };
}
