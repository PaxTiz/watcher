import type { PasskeyTransport } from "@watcher/common";

import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type FindAllByUserInput = { user_id: string };
export type FindAllByUserOutput = Array<
  Pick<DatabaseSchema["passkeys"], "id" | "name" | "backed_up" | "created_at" | "last_used_at">
>;

export type FindByIdInput = { id: string };
export type FindByIdOutput = DatabaseSchema["passkeys"] | undefined;

export type CountByUserInput = { user_id: string };
export type CountByUserOutput = number;

export type CreateData = {
  id: string;
  user_id: string;
  name: string;
  public_key: string;
  counter: number;
  backed_up: boolean;
  transports: Array<PasskeyTransport>;
  aaguid: string | null;
};
export type CreateInput = { data: CreateData; options?: RepositoryContext };
export type CreateOutput = void;

export type MarkAsUsedInput = { id: string; counter: number; options?: RepositoryContext };
export type MarkAsUsedOutput = void;

export type RenameInput = {
  id: string;
  user_id: string;
  name: string;
  options?: RepositoryContext;
};
export type RenameOutput = boolean;

export type RemoveInput = { id: string; user_id: string; options?: RepositoryContext };
export type RemoveOutput = boolean;
