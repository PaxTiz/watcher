import { sql } from "kysely";

import type {
  FindInput,
  FindOutput,
  IncrementInput,
  IncrementOutput,
  RemoveExpiredInput,
  RemoveExpiredOutput,
  RemoveInput,
  RemoveOutput,
} from "../../types/rate_limits";
import { resolveDatabase, useDatabase } from "../database";

export async function increment({
  type,
  key,
  ttl,
  options,
}: IncrementInput): Promise<IncrementOutput> {
  const database = resolveDatabase(options);
  const is_expired = sql<boolean>`rate_limits.expires_at <= CURRENT_TIMESTAMP`;

  return database
    .insertInto("rate_limits")
    .values({
      type,
      key,
      attempts: 1,
      expires_at: sql<string>`CURRENT_TIMESTAMP + MAKE_INTERVAL(secs => ${ttl})`,
    })
    .onConflict((oc) =>
      oc.columns(["type", "key"]).doUpdateSet((eb) => ({
        attempts: sql<number>`CASE WHEN ${is_expired} THEN 1 ELSE rate_limits.attempts + 1 END`,
        expires_at: sql<string>`CASE WHEN ${is_expired} THEN ${eb.ref("excluded.expires_at")} ELSE rate_limits.expires_at END`,
      })),
    )
    .returning(["attempts", "expires_at"])
    .executeTakeFirstOrThrow();
}

export async function find({ type, key }: FindInput): Promise<FindOutput> {
  return useDatabase()
    .selectFrom("rate_limits")
    .select(["attempts", "expires_at"])
    .where("type", "=", type)
    .where("key", "=", key)
    .where("expires_at", ">", sql<string>`CURRENT_TIMESTAMP`)
    .executeTakeFirst();
}

export async function remove({ type, key, options }: RemoveInput): Promise<RemoveOutput> {
  const database = resolveDatabase(options);

  await database
    .deleteFrom("rate_limits")
    .where("type", "=", type)
    .where("key", "=", key)
    .execute();
}

export async function remove_expired({
  options,
}: RemoveExpiredInput = {}): Promise<RemoveExpiredOutput> {
  const database = resolveDatabase(options);

  const result = await database
    .deleteFrom("rate_limits")
    .where("expires_at", "<=", sql<string>`CURRENT_TIMESTAMP`)
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
