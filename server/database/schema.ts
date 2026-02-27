import type { Generated } from "kysely";
import type { CredentialsType } from "#shared/types/credentials";
import type { SubscriptionType } from "#shared/types/subscriptions";

export type SubscriptionTable = {
  id: Generated<number>;

  service_id: string;

  service: SubscriptionType;

  name: string;

  url: string;

  logo: string;
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
};

export type Database = {
  subscriptions: SubscriptionTable;
  credentials: CredentialTable;
  videos: VideoTable;
};
