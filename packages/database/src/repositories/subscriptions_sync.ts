import { sql } from "kysely";

import type {
  ClaimDueInput,
  ClaimDueOutput,
  FindAllForUserInput,
  FindAllForUserOutput,
  RecordFailureInput,
  RecordFailureOutput,
  RescheduleInput,
  RescheduleOutput,
  StatsInput,
  StatsOutput,
} from "../../types/subscriptions_sync";
import { resolveDatabase, useDatabase } from "../database";

export async function claim_due({
  service,
  limit,
  lease_seconds,
}: ClaimDueInput): Promise<ClaimDueOutput> {
  return useDatabase()
    .with("claimed", (db) =>
      db
        .updateTable("subscriptions_sync")
        .set({
          next_check_at: sql<string | null>`CASE
            WHEN EXISTS (
              SELECT 1 FROM user_subscriptions
              WHERE user_subscriptions.subscription_id = subscriptions_sync.subscription_id
            )
            THEN now() + make_interval(secs => ${lease_seconds})
          END`,
        })
        .where("subscription_id", "in", (eb) =>
          eb
            .selectFrom("subscriptions_sync")
            .select("subscription_id")
            .where("service", "=", service)
            .where("next_check_at", "<=", sql<string>`now()`)
            .orderBy("next_check_at")
            .limit(limit)
            .forUpdate()
            .skipLocked(),
        )
        .returning(["subscription_id", "next_check_at", "last_video_at", "failures"]),
    )
    .selectFrom("claimed")
    .innerJoin("subscriptions", "subscriptions.id", "claimed.subscription_id")
    .where("claimed.next_check_at", "is not", null)
    .select([
      "claimed.subscription_id",
      "claimed.last_video_at",
      "claimed.failures",
      "subscriptions.service_id",
      "subscriptions.name",
    ])
    .execute();
}

export async function find_all_for_user({
  user_id,
  service,
}: FindAllForUserInput): Promise<FindAllForUserOutput> {
  return useDatabase()
    .selectFrom("subscriptions_sync")
    .innerJoin("subscriptions", "subscriptions.id", "subscriptions_sync.subscription_id")
    .innerJoin(
      "user_subscriptions",
      "user_subscriptions.subscription_id",
      "subscriptions_sync.subscription_id",
    )
    .select([
      "subscriptions_sync.subscription_id",
      "subscriptions_sync.last_video_at",
      "subscriptions_sync.failures",
      "subscriptions.service_id",
      "subscriptions.name",
    ])
    .where("user_subscriptions.user_id", "=", user_id)
    .where("subscriptions_sync.service", "=", service)
    .execute();
}

export async function reschedule({
  subscription_id,
  next_check_at,
  last_video_at,
  options,
}: RescheduleInput): Promise<RescheduleOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("subscriptions_sync")
    .set({
      next_check_at,
      checked_at: sql<string>`now()`,
      last_video_at: sql<string | null>`greatest(last_video_at, ${last_video_at}::timestamptz)`,
      failures: 0,
    })
    .where("subscription_id", "=", subscription_id)
    .where("next_check_at", "is not", null)
    .execute();
}

export async function record_failure({
  subscription_id,
  next_check_at,
  options,
}: RecordFailureInput): Promise<RecordFailureOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("subscriptions_sync")
    .set((eb) => ({ next_check_at, failures: eb("failures", "+", 1) }))
    .where("subscription_id", "=", subscription_id)
    .where("next_check_at", "is not", null)
    .execute();
}

export async function stats({ service }: StatsInput): Promise<StatsOutput> {
  return useDatabase()
    .selectFrom("subscriptions_sync")
    .where("service", "=", service)
    .where("next_check_at", "is not", null)
    .select([
      sql<number>`count(*)::int`.as("scheduled"),
      sql<number>`(count(*) FILTER (WHERE next_check_at <= now()))::int`.as("due"),
      sql<number>`(count(*) FILTER (WHERE failures > 0))::int`.as("failing"),
      sql<number>`COALESCE(extract(epoch FROM now() - min(next_check_at) FILTER (WHERE next_check_at <= now())), 0)::int`.as(
        "lag_seconds",
      ),
    ])
    .executeTakeFirstOrThrow();
}
