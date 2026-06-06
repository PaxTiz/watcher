import type { ColumnType, Generated, Insertable } from "kysely";

import type { CredentialsType } from "#shared/types/credentials";
import type { SubscriptionType } from "#shared/types/subscriptions";

export type UserTable = {
  id: Generated<string>;

  name: string;

  bluesky_did: string | null;

  bluesky_handle: string | null;

  is_onboarded: boolean;

  created_at: ColumnType<string, string | undefined, never>;

  last_login_at: ColumnType<string, string | undefined, never>;
};

export type SubscriptionTable = {
  id: Generated<string>;

  service_id: string;

  service: SubscriptionType;

  name: string;

  url: string;

  logo: string;

  last_synced_at: string;

  slug: ColumnType<string, string, never>;
};

export type CredentialTable = {
  service: CredentialsType;

  service_id: string;

  access_token: string;

  access_token_expires_at: Date;

  refresh_token: string;

  refresh_token_expires_at: Date;

  user_id: string;
};

export type VideoTable = {
  id: Generated<string>;

  service: SubscriptionType;

  service_id: string;

  subscription_id: string;

  title: string;

  description: string;

  duration: number;

  url: string;

  thumbnail: string;

  created_at: string;

  last_synced_at: string;
};

export type UserSubscriptionTable = {
  user_id: string;

  subscription_id: string;

  is_favorite: ColumnType<boolean, boolean | undefined, boolean | undefined>;

  is_hidden: ColumnType<boolean, boolean | undefined, boolean | undefined>;
};

export type HiddenUsersVideosTable = {
  user_id: string;

  video_id: string;
};

export type UsersVideosProgression = {
  user_id: string;

  video_id: string;

  progression: number;
};

export type Database = {
  users: UserTable;
  subscriptions: SubscriptionTable;
  user_subscriptions: UserSubscriptionTable;
  credentials: CredentialTable;
  videos: VideoTable;
  hidden_users_videos: HiddenUsersVideosTable;
  users_videos_progression: UsersVideosProgression;
};

export type SubscriptionTableInsert = Insertable<SubscriptionTable>;
