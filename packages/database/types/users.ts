import type { CredentialsType } from "@watcher/common";

import type { DatabaseSchema, DatabaseSchemaUpdate, RepositoryContext } from "../src/database";

export type FindByIdInput = { id: string; options?: RepositoryContext };
export type FindByIdOutput = DatabaseSchema["users"] | undefined;

export type FindByCredentialInput = { service: CredentialsType; service_id: string };
export type FindByCredentialOutput = DatabaseSchema["users"] | undefined;

export type CreateData = { name: string };
export type CreateInput = { data: CreateData; options?: RepositoryContext };
export type CreateOutput = DatabaseSchema["users"];

export type UpdateData = Pick<DatabaseSchemaUpdate["users"], "name">;
export type UpdateInput = { id: string; data: UpdateData; options?: RepositoryContext };
export type UpdateOutput = void;

export type MarkAsOnboardedInput = { id: string; options?: RepositoryContext };
export type MarkAsOnboardedOutput = void;

export type RemoveInput = { id: string; options?: RepositoryContext };
export type RemoveOutput = void;
