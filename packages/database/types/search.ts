import type { SubscriptionType } from "@watcher/common";

import type { RepositoryContext } from "../src/database";
import type { SubscriptionWithUserState } from "./subscriptions";
import type { FindAllForUserFilters, VideoRow } from "./videos";

export type SearchSort = "relevance" | "recent";

export type SearchVideosFilters = Pick<FindAllForUserFilters, "duration"> & {
  guests?: Array<string>;
};

export type Guest = { key: string; name: string; subscription_id?: string };

export type FindChannelsInput = { user_id: string; query: string; limit: number };
export type FindChannelsOutput = Array<SubscriptionWithUserState>;

export type FindVideosInput = {
  user_id: string;
  query?: string;
  filters: SearchVideosFilters;
  sort: SearchSort;
  limit: number;
};
export type FindVideosOutput = Array<VideoRow & { video_is_hidden: boolean }>;

export type FindGuestsInput = {
  user_id: string;
  query?: string;
  filters: SearchVideosFilters;
  limit: number;
};
export type FindGuestsOutput = Array<{
  key: string;
  name: string;
  logo: string | null;
  videos_count: number;
}>;

export type FindKnownPeopleOutput = {
  channels: Array<{ id: string; name: string }>;
  guests: Array<{ key: string; name: string; videos_count: number }>;
};

export type ReplaceGuestsInput = {
  service: SubscriptionType;
  videos: Array<{ service_id: string; guests: Array<Guest> }>;
  options?: RepositoryContext;
};
export type ReplaceGuestsOutput = void;
