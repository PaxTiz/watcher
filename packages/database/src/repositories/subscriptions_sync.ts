import { sql } from "kysely";

import type {
  ClaimDueInput,
  ClaimDueOutput,
  RecordFailureInput,
  RecordFailureOutput,
  RescheduleInput,
  RescheduleOutput,
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
        .set({ next_check_at: sql<string>`now() + make_interval(secs => ${lease_seconds})` })
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
        .returning(["subscription_id", "last_video_at", "failures"]),
    )
    .selectFrom("claimed")
    .innerJoin("subscriptions", "subscriptions.id", "claimed.subscription_id")
    .select([
      "claimed.subscription_id",
      "claimed.last_video_at",
      "claimed.failures",
      "subscriptions.service_id",
      "subscriptions.name",
    ])
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
