import type { CredentialsType } from "@watcher/common";

import type { DatabaseSchema, RepositoryContext } from "../src/database";

// Tokens are stored as-is: encrypting/decrypting them is the caller's responsibility.
export type CredentialTokens = Pick<
  DatabaseSchema["credentials"],
  "access_token" | "access_token_expires_at" | "refresh_token" | "refresh_token_expires_at"
>;

export type FindByUserInput = { user_id: string; service: CredentialsType };
export type FindByUserOutput = DatabaseSchema["credentials"] | undefined;

export type FindByServiceInput = { service: CredentialsType; service_id: string };
export type FindByServiceOutput = DatabaseSchema["credentials"] | undefined;

export type FindAllByUserInput = { user_id: string };
export type FindAllByUserOutput = Array<
  Pick<DatabaseSchema["credentials"], "service" | "service_id">
>;

export type UpsertData = Omit<DatabaseSchema["credentials"], "invalid_at" | "next_sync_at">;
export type UpsertInput = { data: UpsertData; options?: RepositoryContext };
export type UpsertOutput = void;

export type UpdateTokensInput = {
  service: CredentialsType;
  service_id: string;
  tokens: CredentialTokens;
  options?: RepositoryContext;
};
export type UpdateTokensOutput = void;

export type ClaimDueSyncInput = { service: CredentialsType; limit: number; lease_seconds: number };
export type ClaimDueSyncOutput = Array<Pick<DatabaseSchema["credentials"], "user_id">>;

export type RescheduleSyncInput = {
  service: CredentialsType;
  user_id: string;
  next_sync_at: string;
};
export type RescheduleSyncOutput = void;

export type MarkInvalidInput = { service: CredentialsType; user_id: string };
export type MarkInvalidOutput = void;

export type RemoveInput = {
  user_id: string;
  service: CredentialsType;
  options?: RepositoryContext;
};
export type RemoveOutput = void;
