import type {
  FindAllByUserInput,
  FindAllByUserOutput,
  FindAllForSyncInput,
  FindAllForSyncOutput,
  FindOneByUserInput,
  FindOneByUserOutput,
  UpsertInput,
  UpsertOutput,
} from "../../types/subscriptions";
import { resolveDatabase, useDatabase } from "../database";
import { whereSubscriptionIdentifier } from "../helpers";

function select_with_user_state(user_id: string) {
  return useDatabase()
    .selectFrom("subscriptions")
    .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
    .select([
      "subscriptions.id",
      "subscriptions.name",
      "subscriptions.slug",
      "subscriptions.service",
      "subscriptions.url",
      "subscriptions.logo",
      "subscriptions.last_synced_at",
      "user_subscriptions.is_favorite",
      "user_subscriptions.is_hidden",
    ])
    .select((eb) =>
      eb
        .selectFrom("videos")
        .whereRef("videos.service", "=", "subscriptions.service")
        .whereRef("videos.subscription_id", "=", "subscriptions.service_id")
        .select((eb) => eb.fn.max("videos.created_at").as("created_at"))
        .as("last_video_at"),
    )
    .where("user_subscriptions.user_id", "=", user_id);
}

export async function find_all_by_user({
  user_id,
}: FindAllByUserInput): Promise<FindAllByUserOutput> {
  return select_with_user_state(user_id)
    .orderBy("user_subscriptions.is_hidden", "asc")
    .orderBy("subscriptions.name", "asc")
    .execute();
}

export async function find_one_by_user({
  user_id,
  identifier,
}: FindOneByUserInput): Promise<FindOneByUserOutput> {
  return select_with_user_state(user_id)
    .where(whereSubscriptionIdentifier(identifier))
    .executeTakeFirst();
}

export async function find_all_for_sync({
  user_id,
  service,
}: FindAllForSyncInput): Promise<FindAllForSyncOutput> {
  return useDatabase()
    .selectFrom("user_subscriptions")
    .innerJoin("subscriptions", "subscriptions.id", "user_subscriptions.subscription_id")
    .select(["service", "service_id", "name", "url", "logo", "last_synced_at", "slug"])
    .where("user_subscriptions.user_id", "=", user_id)
    .where("subscriptions.service", "=", service)
    .execute();
}

export async function upsert({ data, options }: UpsertInput): Promise<UpsertOutput> {
  const database = resolveDatabase(options);

  return database
    .insertInto("subscriptions")
    .values(data)
    .onConflict((row) =>
      row.columns(["service", "service_id"]).doUpdateSet({
        logo: (c) => c.ref("excluded.logo"),
        url: (c) => c.ref("excluded.url"),
        name: (c) => c.ref("excluded.name"),
        last_synced_at: (c) => c.ref("excluded.last_synced_at"),
      }),
    )
    .returning("id")
    .executeTakeFirstOrThrow();
}
