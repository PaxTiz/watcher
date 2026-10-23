import type { SubscriptionType, VideoPalette } from "@watcher/common";

import type { DatabaseSchema, DatabaseSchemaInsert, RepositoryContext } from "../src/database";

export type VideoRow = {
  video_id: string;
  video_service: SubscriptionType;
  video_title: string;
  video_description: string;
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
  subscription_url: string;
  subscription_logo: string;
  subscription_last_synced_at: string;
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
  is_favorite?: boolean;
  in_progress?: boolean;
  duration?: VideoDurationFilter;
  created_after?: string;
  created_before?: string;
};

export type FindAllForUserInput = {
  user_id: string;
  filters: FindAllForUserFilters;
  pagination: { page: number; per_page: number; before?: string };
};
export type FindAllForUserOutput = { total: number; items: Array<VideoRow> };

export type FindByIdForUserInput = { id: string; user_id: string };
export type FindByIdForUserOutput = (VideoRow & { subscription_is_hidden: boolean }) | undefined;

export type FindSourceInput = { id: string };
export type FindSourceOutput =
  | Pick<DatabaseSchema["videos"], "service" | "service_id" | "url">
  | undefined;

export type FindAllBySubscriptionInput = { service: SubscriptionType; subscription_id: string };
export type FindAllBySubscriptionOutput = Array<DatabaseSchema["videos"]>;

export type FindAllWithoutPaletteInput = { after_id: string | null; limit: number };
export type FindAllWithoutPaletteOutput = Array<
  Pick<DatabaseSchema["videos"], "id" | "thumbnail_large">
>;

export type UpsertData = Omit<DatabaseSchemaInsert["videos"], "id" | "palette"> & {
  palette: VideoPalette | null;
};
export type UpsertInput = { data: UpsertData; options?: RepositoryContext };
export type UpsertOutput = void;

export type UpdatePaletteInput = { id: string; palette: VideoPalette; options?: RepositoryContext };
export type UpdatePaletteOutput = void;

export type RemoveByServiceIdInput = {
  service: SubscriptionType;
  service_id: string;
  options?: RepositoryContext;
};
export type RemoveByServiceIdOutput = void;

export type HideForUserInput = { user_id: string; video_id: string; options?: RepositoryContext };
export type HideForUserOutput = void;

export type UpsertProgressionInput = {
  user_id: string;
  video_id: string;
  progression: number;
  options?: RepositoryContext;
};
export type UpsertProgressionOutput = void;
