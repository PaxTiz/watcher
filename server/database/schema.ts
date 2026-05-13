import type { ColumnType, Generated } from "kysely";

import type { CredentialsType } from "#shared/types/credentials";
import type { SubscriptionType } from "#shared/types/subscriptions";

export type UserTable = {
  id: Generated<string>;

  name: string;

  bluesky_did: string | null;

  bluesky_handle: string | null;

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

export type Database = {
  users: UserTable;
  subscriptions: SubscriptionTable;
  credentials: CredentialTable;
  videos: VideoTable;
};
