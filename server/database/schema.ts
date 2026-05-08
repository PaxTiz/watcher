import type { ColumnType, Generated } from "kysely";

import type { CredentialsType } from "#shared/types/credentials";
import type { SubscriptionType } from "#shared/types/subscriptions";

export type UserTable = {
  id: Generated<string>;

  name: string;

  bluesky_did: string;

  bluesky_handle: string;

  created_at: ColumnType<string, string | undefined, never>;

  last_login_at: ColumnType<string, string | undefined, never>;
};

export type SubscriptionTable = {
  id: Generated<number>;

  service_id: string;

  service: SubscriptionType;

  name: string;

  url: string;

  logo: string;

  last_synced_at: string;
};

export type CredentialTable = {
  id: Generated<number>;

  service: CredentialsType;

  access_token: string;

  refresh_token: string;

  expires_at: string;

  user_id: string;
};

export type VideoTable = {
  id: Generated<number>;

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

export type Database = {
  users: UserTable;
  subscriptions: SubscriptionTable;
  credentials: CredentialTable;
  videos: VideoTable;
};
