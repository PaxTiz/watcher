import { sql } from "kysely";

import type {
  AddManyInput,
  AddManyOutput,
  ClaimInput,
  ClaimOutput,
  FindKnownInput,
  FindKnownOutput,
  PostponeInput,
  PostponeOutput,
  RemoveManyInput,
  RemoveManyOutput,
  StatsInput,
  StatsOutput,
} from "../../types/pending_videos";
import { resolveDatabase, useDatabase } from "../database";

export async function find_known({
  service,
  service_ids,
}: FindKnownInput): Promise<FindKnownOutput> {
  if (service_ids.length === 0) {
    return [];
  }

  const rows = await useDatabase()
    .selectFrom("videos")
    .select("service_id")
    .where("service", "=", service)
    .where("service_id", "in", service_ids)
    .union((db) =>
      db
        .selectFrom("pending_videos")
        .select("service_id")
        .where("service", "=", service)
        .where("service_id", "in", service_ids),
    )
    .execute();

  return rows.map((row) => row.service_id);
}

export async function add_many({ data, options }: AddManyInput): Promise<AddManyOutput> {
  const database = resolveDatabase(options);

  if (data.length === 0) {
    return;
  }

  await database
    .insertInto("pending_videos")
    .values(data)
    .onConflict((oc) => oc.columns(["service", "service_id"]).doNothing())
    .execute();
}

export async function claim({ service, limit, lease_seconds }: ClaimInput): Promise<ClaimOutput> {
  return useDatabase()
    .with("claimed", (db) =>
      db
        .updateTable("pending_videos")
        .set({ next_attempt_at: sql<string>`now() + make_interval(secs => ${lease_seconds})` })
        .where("service", "=", service)
        .where("service_id", "in", (eb) =>
          eb
            .selectFrom("pending_videos")
            .select("service_id")
            .where("service", "=", service)
            .where("next_attempt_at", "<=", sql<string>`now()`)
            .orderBy("next_attempt_at")
            .limit(limit)
            .forUpdate()
            .skipLocked(),
        )
        .returning(["service_id", "subscription_id", "content_type", "attempts"]),
    )
    .selectFrom("claimed")
    .innerJoin("subscriptions", "subscriptions.id", "claimed.subscription_id")
    .select([
      "claimed.service_id",
      "claimed.content_type",
      "claimed.attempts",
      "subscriptions.service_id as channel_id",
      "subscriptions.name as channel_name",
    ])
    .execute();
}

export async function remove_many({
  service,
  service_ids,
  options,
}: RemoveManyInput): Promise<RemoveManyOutput> {
  const database = resolveDatabase(options);

  if (service_ids.length === 0) {
    return;
  }

  await database
    .deleteFrom("pending_videos")
    .where("service", "=", service)
    .where("service_id", "in", service_ids)
    .execute();
}

export async function postpone({
  service,
  service_ids,
  next_attempt_at,
  failed,
}: PostponeInput): Promise<PostponeOutput> {
  if (service_ids.length === 0) {
    return;
  }

  await useDatabase()
    .updateTable("pending_videos")
    .set((eb) => ({
      next_attempt_at,
      attempts: failed ? eb("attempts", "+", 1) : eb.ref("attempts"),
    }))
    .where("service", "=", service)
    .where("service_id", "in", service_ids)
    .execute();
}

export async function stats({ service }: StatsInput): Promise<StatsOutput> {
  return useDatabase()
    .selectFrom("pending_videos")
    .where("service", "=", service)
    .select([
      sql<number>`count(*)::int`.as("size"),
      sql<number>`COALESCE(max(attempts), 0)::int`.as("max_attempts"),
      sql<number>`COALESCE(extract(epoch FROM now() - min(next_attempt_at) FILTER (WHERE next_attempt_at <= now())), 0)::int`.as(
        "lag_seconds",
      ),
    ])
    .executeTakeFirstOrThrow();
}
