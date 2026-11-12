import type { SubscriptionType, VideoPalette } from "@watcher/common";

import type { DatabaseSchema, DatabaseSchemaInsert, RepositoryContext } from "../src/database";

export type VideoRow = {
  video_id: string;
  video_service: SubscriptionType;
  video_title: string;
  video_duration: number;
  video_url: string;
  video_thumbnail_small: string;
  video_thumbnail_large: string;
  video_palette: VideoPalette | null;
  video_created_at: string;
  video_viewing_progression: number;
  subscription_id: string;
  subscription_name: string;
  subscription_slug: string;
  subscription_service: SubscriptionType;
  subscription_logo: string;
  subscription_is_favorite: boolean;
};

export type VideoDurationFilter =
  | "less_than_10_minutes"
  | "between_10_30_minutes"
  | "between_30_60_minutes"
  | "greater_than_1_hour";

export type FindAllForUserFilters = {
  query?: string;
  service?: SubscriptionType;
  subscription_id?: string;
  mentions?: Array<string>; // videos mentioning all of them, with or without the @
  is_favorite?: boolean;
  in_progress?: boolean;
  with_hidden?: boolean; // hidden videos only: videos of hidden subscriptions are never listed
  with_watched?: boolean;
  duration?: VideoDurationFilter;
  created_after?: string;
  created_before?: string;
};

export type VideoSort = "relevance" | "recent";

export type FindAllForUserInput = {
  user_id: string;
  filters: FindAllForUserFilters;
  sort?: VideoSort; // relevance only applies to a search, defaults to "relevance"
  pagination: { page: number; per_page: number; before?: string; with_total: boolean };
};
export type FindAllForUserOutput = {
  total: number | undefined;
  items: Array<VideoRow & { video_is_hidden: boolean }>;
  has_more: boolean;
};

export type FindMentionsForUserInput = {
  user_id: string;
  filters: FindAllForUserFilters;
  limit: number;
};
export type FindMentionsForUserOutput = Array<{ mention: string; videos_count: number }>;

export type FindByIdForUserInput = { id: string; user_id: string };
export type FindByIdForUserOutput =
  | (VideoRow & {
      video_description: string;
      subscription_service_id: string;
    })
  | undefined;

export type FindAdjacentInput = {
  id: string;
  user_id: string;
  limit: number;
  order: "asc" | "desc";
};
export type FindAdjacentOutput = Array<VideoRow>;

export type FindSourceInput = { id: string; user_id: string; viewable_only?: boolean };
export type FindSourceOutput =
  | Pick<DatabaseSchema["videos"], "service" | "service_id" | "url">
  | undefined;

export type FindThumbnailsInput = { id: string };
export type FindThumbnailsOutput =
  | Pick<
      DatabaseSchema["videos"],
      | "service"
      | "service_id"
      | "subscription_id"
      | "thumbnail_small"
      | "thumbnail_large"
      | "thumbnail_large_source"
    >
  | undefined;

export type FindAllBySubscriptionInput = { service: SubscriptionType; subscription_id: string };
export type FindAllBySubscriptionOutput = Array<
  Omit<DatabaseSchema["videos"], "search" | "mentions">
>;

export type FindAllWithoutPaletteInput = { after_id: string | null; limit: number };
export type FindAllWithoutPaletteOutput = Array<
  Pick<DatabaseSchema["videos"], "id" | "thumbnail_small">
>;

export type UpsertData = Omit<DatabaseSchemaInsert["videos"], "id" | "palette"> & {
  palette: VideoPalette | null;
};
export type UpsertInput = { data: Array<UpsertData>; options?: RepositoryContext };
export type UpsertOutput = void;

export type UpdatePaletteInput = { id: string; palette: VideoPalette; options?: RepositoryContext };
export type UpdatePaletteOutput = void;

export type UpdateLargeThumbnailInput = {
  id: string;
  thumbnail_large: string;
  options?: RepositoryContext;
};
export type UpdateLargeThumbnailOutput = void;

export type RemoveByServiceIdInput = {
  service: SubscriptionType;
  service_id: string;
  options?: RepositoryContext;
};
export type RemoveByServiceIdOutput = void;

export type HideForUserInput = { user_id: string; video_id: string; options?: RepositoryContext };
export type HideForUserOutput = void;

export type ShowForUserInput = { user_id: string; video_id: string; options?: RepositoryContext };
export type ShowForUserOutput = void;

export type UpsertProgressionInput = {
  user_id: string;
  video_id: string;
  progression: number;
  options?: RepositoryContext;
};
export type UpsertProgressionOutput = void;
