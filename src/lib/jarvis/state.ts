import type {
  ConsumerListingCard,
  ConsumerSearchCriteria,
  CriteriaPatch,
  DisplayedResultSet,
  JarvisSearchState,
  PropertyReference,
  ReferenceResolution,
  SearchRequirement,
} from "./types";

const MAX_RESULT_HISTORY = 20;

export function createJarvisSearchState(): JarvisSearchState {
  return {
    criteria: {},
    listingsById: {},
    resultHistory: [],
    favoriteIds: [],
    dismissedIds: [],
  };
}

function latestResultSet(state: JarvisSearchState): DisplayedResultSet | undefined {
  return state.resultHistory.at(-1);
}

function normalizeWords(words: string[]): string[] {
  return words
    .flatMap((word) => word.toLowerCase().split(/[^a-z0-9]+/))
    .filter((word) => word.length > 1);
}

function searchableText(listing: ConsumerListingCard): string {
  return [
    listing.address,
    listing.city,
    listing.state,
    listing.postalCode,
    listing.pool ? "pool" : "",
  ]
    .join(" ")
    .toLowerCase();
}

export function resolvePropertyReference(
  state: JarvisSearchState,
  reference: PropertyReference
): ReferenceResolution {
  if (reference.kind === "stableId") {
    const listing = state.listingsById[reference.stableId];
    return listing ? { status: "resolved", listing } : { status: "not_found" };
  }

  const latest = latestResultSet(state);
  if (!latest) return { status: "not_found" };

  if (reference.kind === "ordinal") {
    const propertyId = latest.propertyIds[reference.ordinal - 1];
    const listing = propertyId ? state.listingsById[propertyId] : undefined;
    return listing ? { status: "resolved", listing } : { status: "not_found" };
  }

  const words = normalizeWords(reference.words);
  if (words.length === 0) return { status: "not_found" };
  const candidates = latest.propertyIds
    .map((id) => state.listingsById[id])
    .filter((listing): listing is ConsumerListingCard => Boolean(listing))
    .filter((listing) => words.every((word) => searchableText(listing).includes(word)));

  if (candidates.length === 1) return { status: "resolved", listing: candidates[0] };
  if (candidates.length > 1) return { status: "ambiguous", candidates };
  return { status: "not_found" };
}

function wouldRelaxNumber<T extends number>(
  current: SearchRequirement<T> | undefined,
  next: SearchRequirement<T> | undefined,
  direction: "minimum" | "maximum"
): boolean {
  if (!current || current.strength !== "must") return false;
  if (!next) return true;
  return direction === "minimum" ? next.value < current.value : next.value > current.value;
}

function wouldRelaxBoolean(
  current: SearchRequirement<boolean> | undefined,
  next: SearchRequirement<boolean> | undefined
): boolean {
  return Boolean(current?.strength === "must" && current.value && (!next || !next.value));
}

function wouldRelaxSet(
  current: SearchRequirement<string[]> | undefined,
  next: SearchRequirement<string[]> | undefined
): boolean {
  if (!current || current.strength !== "must") return false;
  if (!next) return true;
  const currentAllowed = new Set(current.value.map((value) => value.toLowerCase()));
  // These arrays represent acceptable alternatives. Adding another option
  // broadens the search; removing one narrows it.
  return next.value.some((value) => !currentAllowed.has(value.toLowerCase()));
}

export function applyCriteriaPatch(
  state: JarvisSearchState,
  patch: CriteriaPatch,
  options: { relaxMustHaves?: boolean } = {}
): JarvisSearchState {
  const nextCriteria: ConsumerSearchCriteria = { ...state.criteria };
  const relaxations: string[] = [];

  if ("neighborhoods" in patch) {
    if (wouldRelaxSet(state.criteria.neighborhoods, patch.neighborhoods)) relaxations.push("neighborhoods");
    nextCriteria.neighborhoods = patch.neighborhoods;
  }
  if ("minBeds" in patch) {
    if (wouldRelaxNumber(state.criteria.minBeds, patch.minBeds, "minimum")) relaxations.push("minBeds");
    nextCriteria.minBeds = patch.minBeds;
  }
  if ("minBaths" in patch) {
    if (wouldRelaxNumber(state.criteria.minBaths, patch.minBaths, "minimum")) relaxations.push("minBaths");
    nextCriteria.minBaths = patch.minBaths;
  }
  if ("minPrice" in patch) {
    if (wouldRelaxNumber(state.criteria.minPrice, patch.minPrice, "minimum")) relaxations.push("minPrice");
    nextCriteria.minPrice = patch.minPrice;
  }
  if ("maxPrice" in patch) {
    if (wouldRelaxNumber(state.criteria.maxPrice, patch.maxPrice, "maximum")) relaxations.push("maxPrice");
    nextCriteria.maxPrice = patch.maxPrice;
  }
  if ("pool" in patch) {
    if (wouldRelaxBoolean(state.criteria.pool, patch.pool)) relaxations.push("pool");
    nextCriteria.pool = patch.pool;
  }
  if ("propertyTypes" in patch) {
    if (wouldRelaxSet(state.criteria.propertyTypes, patch.propertyTypes)) relaxations.push("propertyTypes");
    nextCriteria.propertyTypes = patch.propertyTypes;
  }

  if (relaxations.length > 0 && !options.relaxMustHaves) {
    throw new Error(`Confirmation required before relaxing: ${relaxations.join(", ")}`);
  }

  if (patch.similarTo === null) {
    delete nextCriteria.similarToPropertyId;
  } else if (patch.similarTo) {
    const resolution = resolvePropertyReference(state, patch.similarTo);
    if (resolution.status === "ambiguous") throw new Error("Property reference is ambiguous");
    if (resolution.status === "not_found") throw new Error("Property reference was not found");
    nextCriteria.similarToPropertyId = resolution.listing.stableId;
  }

  return { ...state, criteria: nextCriteria };
}

export function recordDisplayedResults(
  state: JarvisSearchState,
  listings: ConsumerListingCard[],
  displayedAt = new Date().toISOString()
): JarvisSearchState {
  const uniqueListings = [...new Map(listings.map((listing) => [listing.stableId, listing])).values()];
  const listingsById = { ...state.listingsById };
  for (const listing of uniqueListings) listingsById[listing.stableId] = listing;

  const resultSet: DisplayedResultSet = {
    id: `${displayedAt}:${uniqueListings.map((listing) => listing.stableId).join(",")}`,
    displayedAt,
    propertyIds: uniqueListings.map((listing) => listing.stableId),
  };

  return {
    ...state,
    listingsById,
    resultHistory: [...state.resultHistory, resultSet].slice(-MAX_RESULT_HISTORY),
  };
}

function withUniqueId(ids: string[], stableId: string): string[] {
  return ids.includes(stableId) ? ids : [...ids, stableId];
}

export function favoriteProperty(state: JarvisSearchState, reference: PropertyReference): JarvisSearchState {
  const resolution = resolvePropertyReference(state, reference);
  if (resolution.status !== "resolved") throw new Error("A single property must be identified");
  return {
    ...state,
    favoriteIds: withUniqueId(state.favoriteIds, resolution.listing.stableId),
    dismissedIds: state.dismissedIds.filter((id) => id !== resolution.listing.stableId),
  };
}

export function dismissProperty(state: JarvisSearchState, reference: PropertyReference): JarvisSearchState {
  const resolution = resolvePropertyReference(state, reference);
  if (resolution.status !== "resolved") throw new Error("A single property must be identified");
  return {
    ...state,
    dismissedIds: withUniqueId(state.dismissedIds, resolution.listing.stableId),
    favoriteIds: state.favoriteIds.filter((id) => id !== resolution.listing.stableId),
  };
}
