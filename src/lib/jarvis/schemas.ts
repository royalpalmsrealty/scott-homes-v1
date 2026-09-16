import { z } from "zod";

const httpsUrl = z.url().max(2000).refine((value) => new URL(value).protocol === "https:", {
  message: "HTTPS is required",
});

export const ConsumerListingCardSchema = z
  .object({
    source: z.literal("idx"),
    stableId: z.string().regex(/^idx:[^:]+:[^:]+$/),
    listingId: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(2).max(30),
    postalCode: z.string().trim().min(5).max(20),
    price: z.number().nonnegative(),
    status: z.string().trim().min(1).max(100),
    beds: z.number().nonnegative().nullable(),
    baths: z.number().nonnegative().nullable(),
    squareFeet: z.number().nonnegative().nullable(),
    pool: z.boolean().nullable(),
    photoUrl: httpsUrl.refine(
      (value) => new URL(value).hostname === "cdn.photos.sparkplatform.com",
      { message: "Photo URL must come from the approved MLS photo host" }
    ),
    detailUrl: httpsUrl.refine((value) => {
      const url = new URL(value);
      return (
        url.hostname === "search.royalpalmsrealty.com" &&
        url.pathname.startsWith("/idx/details/listing/")
      );
    }, "A source-provided Royal Palms IDX detail URL is required"),
    attribution: z.string().trim().min(1).max(500),
    retrievedAt: z.iso.datetime(),
  })
  .strict();

export const ConsumerSearchResponseSchema = z
  .object({
    listings: z.array(ConsumerListingCardSchema).max(50),
    retrievedAt: z.iso.datetime(),
  })
  .strict();

