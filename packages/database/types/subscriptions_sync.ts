import type { SubscriptionType } from "@watcher/common";

import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type ClaimDueInput = { service: SubscriptionType; limit: number; lease_seconds: number };
export type ClaimDueOutput = Array<
  Pick<DatabaseSchema["subscriptions_sync"], "subscription_id" | "last_video_at" | "failures"> &
    Pick<DatabaseSchema["subscriptions"], "service_id" | "name">
>;

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
