import type { RepositoryContext } from "../src/database";
import type { SubscriptionIdentifier } from "./subscriptions";

export type AttachInput = { user_id: string; subscription_id: string; options?: RepositoryContext };
export type AttachOutput = void;

export type ToggleFavoriteInput = { user_id: string; identifier: SubscriptionIdentifier };
export type ToggleFavoriteOutput = void;

export type HideInput = { user_id: string; identifier: SubscriptionIdentifier };
export type HideOutput = void;

export type ShowInput = { user_id: string; identifier: SubscriptionIdentifier };
export type ShowOutput = void;
