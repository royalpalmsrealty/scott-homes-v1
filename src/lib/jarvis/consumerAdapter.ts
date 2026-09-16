import "server-only";
import type { ConsumerListingCard, ConsumerSearchCriteria } from "./types";

export type ConsumerSearchResponse = {
  listings: ConsumerListingCard[];
  retrievedAt: string;
};

/**
 * Boundary between the shared Jarvis engine and an IDX-authorized consumer
 * data source. A future implementation must be reviewed against the feed's
 * display license before it is registered here.
 */
export interface ConsumerListingAdapter {
  readonly id: "idx";
  search(criteria: ConsumerSearchCriteria): Promise<ConsumerSearchResponse>;
  getByStableIds(stableIds: string[]): Promise<ConsumerSearchResponse>;
}

export class ConsumerListingAdapterUnavailableError extends Error {
  constructor() {
    super(
      "No authorized MLS-wide consumer listing-data adapter is configured. IDX Broker hosted results can be displayed, but its API does not return MLS-wide listing records."
    );
    this.name = "ConsumerListingAdapterUnavailableError";
  }
}

export function getConsumerListingAdapter(): ConsumerListingAdapter {
  // Fail closed. Do not silently substitute the professional Spark feed or
  // unsupported scraping for consumer display.
  throw new ConsumerListingAdapterUnavailableError();
}

