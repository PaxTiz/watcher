import type { SessionLoginWith } from "@watcher/common";

import type { DatabaseSchema, RepositoryContext } from "../src/database";

export type CreateData = {
  user_id: string;
  login_with: SessionLoginWith;
  login_with_id: string;
  user_agent: string | null;
  expires_at: string;
};
export type CreateInput = { data: CreateData; options?: RepositoryContext };
export type CreateOutput = Pick<DatabaseSchema["sessions"], "id">;

export type FindActiveWithUserInput = { id: string };
export type FindActiveWithUserOutput =
  | (Pick<DatabaseSchema["sessions"], "login_with" | "login_with_id" | "last_seen_at"> &
      DatabaseSchema["users"] & {
        google_id: string | null;
        twitch_id: string | null;
      })
  | undefined;

export type FindAllActiveByUserInput = { user_id: string };
export type FindAllActiveByUserOutput = Array<
  Pick<
    DatabaseSchema["sessions"],
    "id" | "login_with" | "user_agent" | "created_at" | "last_seen_at"
  >
>;

export type TouchInput = { id: string; options?: RepositoryContext };
export type TouchOutput = void;

export type RemoveInput = { id: string; user_id?: string; options?: RepositoryContext };
export type RemoveOutput = boolean;

export type RemoveAllByUserInput = {
  user_id: string;
  except_id?: string;
  options?: RepositoryContext;
};
export type RemoveAllByUserOutput = void;

export type RemoveByLoginMethodInput = {
  user_id: string;
  login_with: SessionLoginWith;
  login_with_id: string;
  except_id?: string;
  options?: RepositoryContext;
};
export type RemoveByLoginMethodOutput = void;
