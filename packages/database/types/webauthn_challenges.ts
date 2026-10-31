import type { RepositoryContext } from "../src/database";

export type CreateInput = {
  data: { id: string; challenge: string; expires_at: string };
  options?: RepositoryContext;
};
export type CreateOutput = void;

export type ConsumeInput = { id: string; options?: RepositoryContext };
export type ConsumeOutput = string | null;

export type RemoveExpiredInput = { options?: RepositoryContext };
export type RemoveExpiredOutput = number;
