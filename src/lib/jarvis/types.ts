export type RequirementStrength = "must" | "preference";

export type SearchRequirement<T> = {
  value: T;
  strength: RequirementStrength;
};

export type ConsumerSearchCriteria = {
  neighborhoods?: SearchRequirement<string[]>;
  minBeds?: SearchRequirement<number>;
  minBaths?: SearchRequirement<number>;
  minPrice?: SearchRequirement<number>;
  maxPrice?: SearchRequirement<number>;
  pool?: SearchRequirement<boolean>;
  propertyTypes?: SearchRequirement<string[]>;
  similarToPropertyId?: string;
};

/**
 * Consumer-safe listing data only. The consumer adapter is responsible for
 * producing this DTO from an IDX-authorized source. Professional-only MLS
 * fields must never be added to this type.
 */
export type ConsumerListingCard = {
  source: "idx";
  stableId: string;
  listingId: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  price: number;
  status: string;
  beds: number | null;
  baths: number | null;
  squareFeet: number | null;
  pool: boolean | null;
  photoUrl: string;
  detailUrl: string;
  attribution: string;
  retrievedAt: string;
};

export type DisplayedResultSet = {
  id: string;
  displayedAt: string;
  propertyIds: string[];
};

export type JarvisSearchState = {
  criteria: ConsumerSearchCriteria;
  listingsById: Record<string, ConsumerListingCard>;
  resultHistory: DisplayedResultSet[];
  favoriteIds: string[];
  dismissedIds: string[];
};

export type CriteriaPatch = Partial<Omit<ConsumerSearchCriteria, "similarToPropertyId">> & {
  similarTo?: PropertyReference | null;
};

export type PropertyReference =
  | { kind: "stableId"; stableId: string }
  | { kind: "ordinal"; ordinal: number }
  | { kind: "cue"; words: string[] };

export type ReferenceResolution =
  | { status: "resolved"; listing: ConsumerListingCard }
  | { status: "ambiguous"; candidates: ConsumerListingCard[] }
  | { status: "not_found" };

