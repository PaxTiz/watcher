import { sql } from "kysely";

import type {
  CreateInput,
  CreateOutput,
  FindActiveWithUserInput,
  FindActiveWithUserOutput,
  FindAllActiveByUserInput,
  FindAllActiveByUserOutput,
  FindAuthenticatedAtInput,
  FindAuthenticatedAtOutput,
  MarkAuthenticatedInput,
  MarkAuthenticatedOutput,
  RemoveAllByUserInput,
  RemoveAllByUserOutput,
  RemoveByLoginMethodInput,
  RemoveByLoginMethodOutput,
  RemoveExpiredInput,
  RemoveExpiredOutput,
  RemoveInput,
  RemoveOutput,
  TouchInput,
  TouchOutput,
} from "../../types/sessions";
import { resolveDatabase, useDatabase, withResolvedTransaction } from "../database";

export async function create({ data, options }: CreateInput): Promise<CreateOutput> {
  return withResolvedTransaction(options, async (database) => {
    await database
      .deleteFrom("sessions")
      .where("user_id", "=", data.user_id)
      .where("expires_at", "<=", sql<string>`CURRENT_TIMESTAMP`)
      .execute();

    return database.insertInto("sessions").values(data).returning("id").executeTakeFirstOrThrow();
  });
}

export async function find_active_with_user({
  id,
}: FindActiveWithUserInput): Promise<FindActiveWithUserOutput> {
  return useDatabase()
    .selectFrom("sessions")
    .innerJoin("users", "users.id", "sessions.user_id")
    .leftJoin("credentials as google", (join) =>
      join.onRef("google.user_id", "=", "users.id").on("google.service", "=", "google"),
    )
    .leftJoin("credentials as twitch", (join) =>
      join.onRef("twitch.user_id", "=", "users.id").on("twitch.service", "=", "twitch"),
    )
    .selectAll("users")
    .select([
      "sessions.login_with",
      "sessions.login_with_id",
      "sessions.last_seen_at",
      "google.service_id as google_id",
      "twitch.service_id as twitch_id",
    ])
    .where("sessions.id", "=", id)
    .where("sessions.expires_at", ">", sql<string>`CURRENT_TIMESTAMP`)
    .executeTakeFirst();
}

export async function find_all_active_by_user({
  user_id,
}: FindAllActiveByUserInput): Promise<FindAllActiveByUserOutput> {
  return useDatabase()
    .selectFrom("sessions")
    .select(["id", "login_with", "user_agent", "created_at", "last_seen_at"])
    .where("user_id", "=", user_id)
    .where("expires_at", ">", sql<string>`CURRENT_TIMESTAMP`)
    .orderBy("last_seen_at", "desc")
    .execute();
}

export async function find_authenticated_at({
  id,
}: FindAuthenticatedAtInput): Promise<FindAuthenticatedAtOutput> {
  return useDatabase()
    .selectFrom("sessions")
    .select("authenticated_at")
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function touch({ id, options }: TouchInput): Promise<TouchOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("sessions")
    .set({ last_seen_at: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
}

export async function mark_authenticated({
  id,
  options,
}: MarkAuthenticatedInput): Promise<MarkAuthenticatedOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("sessions")
    .set({ authenticated_at: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
}

export async function remove({ id, user_id, options }: RemoveInput): Promise<RemoveOutput> {
  const database = resolveDatabase(options);

  let query = database.deleteFrom("sessions").where("id", "=", id);

  if (user_id) {
    query = query.where("user_id", "=", user_id);
  }

  const result = await query.executeTakeFirst();

  return result.numDeletedRows > 0n;
}

export async function remove_all_by_user({
  user_id,
  except_id,
  options,
}: RemoveAllByUserInput): Promise<RemoveAllByUserOutput> {
  const database = resolveDatabase(options);

  let query = database.deleteFrom("sessions").where("user_id", "=", user_id);

  if (except_id) {
    query = query.where("id", "!=", except_id);
  }

  await query.execute();
}

export async function remove_by_login_method({
  user_id,
  login_with,
  login_with_id,
  except_id,
  options,
}: RemoveByLoginMethodInput): Promise<RemoveByLoginMethodOutput> {
  const database = resolveDatabase(options);

  let query = database
    .deleteFrom("sessions")
    .where("user_id", "=", user_id)
    .where("login_with", "=", login_with)
    .where("login_with_id", "=", login_with_id);

  if (except_id) {
    query = query.where("id", "!=", except_id);
  }

  await query.execute();
}

export async function remove_expired({
  options,
}: RemoveExpiredInput = {}): Promise<RemoveExpiredOutput> {
  const database = resolveDatabase(options);

  const result = await database
    .deleteFrom("sessions")
    .where("expires_at", "<=", sql<string>`CURRENT_TIMESTAMP`)
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
