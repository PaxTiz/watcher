import type { SubscriptionType } from "@watcher/common";
import { sql } from "kysely";

import type {
  ClaimDueInput,
  ClaimDueOutput,
  ClaimWebsubDueInput,
  ClaimWebsubDueOutput,
  ConfirmWebsubInput,
  ConfirmWebsubOutput,
  EndLiveInput,
  EndLiveOutput,
  FindMostFollowedInput,
  FindMostFollowedOutput,
  FindAllForUserInput,
  FindAllForUserOutput,
  RecordChecksInput,
  RecordChecksOutput,
  RecordFailureInput,
  RecordFailureOutput,
  RescheduleInput,
  RescheduleOutput,
  StatsInput,
  StatsOutput,
  WakeInput,
  WakeOutput,
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
        .returning([
          "subscription_id",
          "next_check_at",
          "last_video_at",
          "failures",
          "websub_expires_at",
          "live_stream_id",
          "vods_due_at",
        ]),
    )
    .selectFrom("claimed")
    .innerJoin("subscriptions", "subscriptions.id", "claimed.subscription_id")
    .where("claimed.next_check_at", "is not", null)
    .select([
      "claimed.subscription_id",
      "claimed.last_video_at",
      "claimed.failures",
      "claimed.websub_expires_at",
      "claimed.live_stream_id",
      "claimed.vods_due_at",
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
      "subscriptions_sync.websub_expires_at",
      "subscriptions_sync.live_stream_id",
      "subscriptions_sync.vods_due_at",
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
      sql<number>`(count(*) FILTER (WHERE websub_expires_at > now()))::int`.as("websub_active"),
      sql<number>`COALESCE(extract(epoch FROM now() - min(next_check_at) FILTER (WHERE next_check_at <= now())), 0)::int`.as(
        "lag_seconds",
      ),
    ])
    .executeTakeFirstOrThrow();
}

const subscription_by_channel = (service: SubscriptionType, channel_id: string) =>
  useDatabase()
    .selectFrom("subscriptions")
    .select("id")
    .where("service", "=", service)
    .where("service_id", "=", channel_id);

export async function claim_websub_due({
  service,
  limit,
  lease_seconds,
}: ClaimWebsubDueInput): Promise<ClaimWebsubDueOutput> {
  return useDatabase()
    .with("claimed", (db) =>
      db
        .updateTable("subscriptions_sync")
        .set({
          websub_renew_at: sql<string | null>`CASE
            WHEN next_check_at IS NOT NULL THEN now() + make_interval(secs => ${lease_seconds})
          END`,
        })
        .where("subscription_id", "in", (eb) =>
          eb
            .selectFrom("subscriptions_sync")
            .select("subscription_id")
            .where("service", "=", service)
            .where("websub_renew_at", "<=", sql<string>`now()`)
            .orderBy("websub_renew_at")
            .limit(limit)
            .forUpdate()
            .skipLocked(),
        )
        .returning(["subscription_id", "websub_renew_at"]),
    )
    .selectFrom("claimed")
    .innerJoin("subscriptions", "subscriptions.id", "claimed.subscription_id")
    .where("claimed.websub_renew_at", "is not", null)
    .select("subscriptions.service_id")
    .execute();
}

export async function confirm_websub({
  service,
  channel_id,
  expires_at,
  renew_at,
}: ConfirmWebsubInput): Promise<ConfirmWebsubOutput> {
  const result = await useDatabase()
    .updateTable("subscriptions_sync")
    .set({ websub_expires_at: expires_at, websub_renew_at: renew_at })
    .where("subscription_id", "=", subscription_by_channel(service, channel_id))
    .where("next_check_at", "is not", null)
    .executeTakeFirst();

  return result.numUpdatedRows > 0n;
}

export async function wake({ service, channel_id }: WakeInput): Promise<WakeOutput> {
  const result = await useDatabase()
    .updateTable("subscriptions_sync")
    .set({ next_check_at: sql<string>`now()` })
    .where("subscription_id", "=", subscription_by_channel(service, channel_id))
    .where("next_check_at", "is not", null)
    .executeTakeFirst();

  return result.numUpdatedRows > 0n;
}

export async function record_checks({ data }: RecordChecksInput): Promise<RecordChecksOutput> {
  if (data.length === 0) {
    return;
  }

  await sql`
    UPDATE subscriptions_sync ss
    SET
      next_check_at = c.next_check_at,
      checked_at = now(),
      failures = 0,
      live_stream_id = c.live_stream_id,
      last_video_at = greatest(ss.last_video_at, c.last_video_at),
      vods_due_at = CASE
        WHEN c.vods_read THEN c.vods_due_at
        ELSE least(ss.vods_due_at, c.vods_due_at)
      END
    FROM jsonb_to_recordset(${JSON.stringify(data)}::jsonb) AS c(
      subscription_id uuid,
      next_check_at timestamptz,
      live_stream_id varchar,
      last_video_at timestamptz,
      vods_due_at timestamptz,
      vods_read boolean
    )
    WHERE ss.subscription_id = c.subscription_id AND ss.next_check_at IS NOT NULL
  `.execute(useDatabase());
}

export async function find_most_followed({
  service,
  limit,
}: FindMostFollowedInput): Promise<FindMostFollowedOutput> {
  const rows = await useDatabase()
    .selectFrom("subscriptions_sync")
    .innerJoin("subscriptions", "subscriptions.id", "subscriptions_sync.subscription_id")
    .select("subscriptions.service_id")
    .where("subscriptions_sync.service", "=", service)
    .where("subscriptions_sync.next_check_at", "is not", null)
    .orderBy(
      (eb) =>
        eb
          .selectFrom("user_subscriptions")
          .select(sql<number>`count(*)`.as("followers"))
          .whereRef(
            "user_subscriptions.subscription_id",
            "=",
            "subscriptions_sync.subscription_id",
          ),
      "desc",
    )
    .limit(limit)
    .execute();

  return rows.map((row) => row.service_id);
}

export async function end_live({
  service,
  channel_id,
  vods_delay_seconds,
}: EndLiveInput): Promise<EndLiveOutput> {
  const result = await useDatabase()
    .updateTable("subscriptions_sync")
    .set({
      live_stream_id: null,
      vods_due_at: sql<string>`least(vods_due_at, now() + make_interval(secs => ${vods_delay_seconds}))`,
    })
    .where("subscription_id", "=", subscription_by_channel(service, channel_id))
    .where("next_check_at", "is not", null)
    .executeTakeFirst();

  return result.numUpdatedRows > 0n;
}
