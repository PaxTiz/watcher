import type {
  GuestResource,
  SearchResource,
  SubscriptionResource,
  VideoListResource,
} from "@watcher/common";

import type { SearchValidators } from "#shared/validators/search";

type SearchQuery = SearchValidators["search"]["query"];

export type SearchType = SearchQuery["type"];

export type SearchFilters = {
  type: SearchType;
  duration: NonNullable<SearchQuery["duration"]> | "any";
  sort: SearchQuery["sort"];
  guests: Array<Pick<GuestResource, "key" | "name" | "logo">>; // kept to display them
};

export type SearchResults = SearchResource;

export type SearchResult =
  | { kind: "channel"; channel: SubscriptionResource }
  | { kind: "video"; video: VideoListResource };

export const empty_search_results = (): SearchResults => ({
  channels: [],
  videos: [],
  guests: [],
});

export function search(
  query: string,
  filters: SearchFilters,
  signal: AbortSignal,
): Promise<SearchResults> {
  return $fetch("/api/search", {
    query: {
      query: query || undefined,
      type: filters.type,
      duration: filters.duration === "any" ? undefined : filters.duration,
      sort: filters.sort,
      guests: filters.guests.length ? filters.guests.map((guest) => guest.key) : undefined,
    },
    signal,
  });
}
