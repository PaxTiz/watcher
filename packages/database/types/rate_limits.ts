import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type IncrementInput = {
  type: string;
  key: string;
  ttl: number; // in seconds, duration of a new window
  options?: RepositoryContext;
};
export type IncrementOutput = Pick<DatabaseSchema["rate_limits"], "attempts" | "expires_at">;

export type FindInput = { type: string; key: string };
export type FindOutput = Pick<DatabaseSchema["rate_limits"], "attempts" | "expires_at"> | undefined;

export type RemoveInput = { type: string; key: string; options?: RepositoryContext };
export type RemoveOutput = void;

export type RemoveExpiredInput = { options?: RepositoryContext };
export type RemoveExpiredOutput = number;
