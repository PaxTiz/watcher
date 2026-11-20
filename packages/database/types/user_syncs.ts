import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type StartInput = { user_id: string; stale_after_seconds: number };
export type StartOutput = boolean;

export type FinishInput = { user_id: string; error: string | null; options?: RepositoryContext };
export type FinishOutput = void;

export type FindInput = { user_id: string };
export type FindOutput =
  | Pick<DatabaseSchema["user_syncs"], "started_at" | "finished_at" | "error">
  | undefined;
