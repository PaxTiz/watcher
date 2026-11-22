import type { SubscriptionType } from "@watcher/common";

import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type ClaimDueInput = { service: SubscriptionType; limit: number; lease_seconds: number };
export type ClaimDueOutput = Array<
  Pick<
    DatabaseSchema["subscriptions_sync"],
    | "subscription_id"
    | "last_video_at"
    | "failures"
    | "websub_expires_at"
    | "live_stream_id"
    | "vods_due_at"
  > &
    Pick<DatabaseSchema["subscriptions"], "service_id" | "name">
>;

export type FindAllForUserInput = { user_id: string; service: SubscriptionType };
export type FindAllForUserOutput = ClaimDueOutput;

export type RescheduleInput = {
  subscription_id: string;
  next_check_at: string;
  last_video_at: string | null;
  options?: RepositoryContext;
};
export type RescheduleOutput = void;

export type RecordFailureInput = {
  subscription_id: string;
  next_check_at: string;
  options?: RepositoryContext;
};
export type RecordFailureOutput = void;

export type StatsInput = { service: SubscriptionType };
export type StatsOutput = {
  scheduled: number;
  due: number;
  failing: number;
  websub_active: number;
  lag_seconds: number;
};

export type ClaimWebsubDueInput = {
  service: SubscriptionType;
  limit: number;
  lease_seconds: number;
};
export type ClaimWebsubDueOutput = Array<Pick<DatabaseSchema["subscriptions"], "service_id">>;

export type ConfirmWebsubInput = {
  service: SubscriptionType;
  channel_id: string;
  expires_at: string;
  renew_at: string;
};
export type ConfirmWebsubOutput = boolean;

export type WakeInput = { service: SubscriptionType; channel_id: string };
export type WakeOutput = boolean;

export type RecordChecksData = {
  subscription_id: string;
  next_check_at: string;
  live_stream_id: string | null;
  last_video_at: string | null;
  vods_due_at: string | null;
  vods_read: boolean;
};
export type RecordChecksInput = { data: Array<RecordChecksData> };
export type RecordChecksOutput = void;

export type FindMostFollowedInput = { service: SubscriptionType; limit: number };
export type FindMostFollowedOutput = Array<string>;

export type EndLiveInput = {
  service: SubscriptionType;
  channel_id: string;
  vods_delay_seconds: number;
};
export type EndLiveOutput = boolean;
