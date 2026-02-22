import { Generated } from "kysely";
import type { CredentialsType } from "#shared/types/credentials";

export type SubscriptionTable = {
  id: Generated<number>;

  service_id: string;

  service: string;

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
};

export type Database = {
  subscriptions: SubscriptionTable;
  credentials: CredentialTable;
};
