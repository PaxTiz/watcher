import { sql } from "kysely";

import type {
  ConsumeInput,
  ConsumeOutput,
  CreateInput,
  CreateOutput,
  RemoveExpiredInput,
  RemoveExpiredOutput,
} from "../../types/webauthn_challenges";
import { resolveDatabase } from "../database";

export async function create({ data, options }: CreateInput): Promise<CreateOutput> {
  const database = resolveDatabase(options);

  await database.insertInto("webauthn_challenges").values(data).execute();
}

export async function consume({ id, options }: ConsumeInput): Promise<ConsumeOutput> {
  const database = resolveDatabase(options);

  const row = await database
    .deleteFrom("webauthn_challenges")
    .where("id", "=", id)
    .returning(["challenge", "expires_at"])
    .executeTakeFirst();

  if (!row || new Date(row.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return row.challenge;
}

export async function remove_expired({
  options,
}: RemoveExpiredInput = {}): Promise<RemoveExpiredOutput> {
  const database = resolveDatabase(options);

  const result = await database
    .deleteFrom("webauthn_challenges")
    .where("expires_at", "<=", sql<string>`CURRENT_TIMESTAMP`)
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
