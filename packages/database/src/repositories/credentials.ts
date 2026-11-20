import { sql } from "kysely";

import type {
  ClaimDueSyncInput,
  ClaimDueSyncOutput,
  FindAllByUserInput,
  FindAllByUserOutput,
  FindByServiceInput,
  FindByServiceOutput,
  FindByUserInput,
  FindByUserOutput,
  MarkInvalidInput,
  MarkInvalidOutput,
  RemoveInput,
  RemoveOutput,
  RescheduleSyncInput,
  RescheduleSyncOutput,
  UpdateTokensInput,
  UpdateTokensOutput,
  UpsertInput,
  UpsertOutput,
} from "../../types/credentials";
import { resolveDatabase, useDatabase } from "../database";

export async function find_by_user({
  user_id,
  service,
}: FindByUserInput): Promise<FindByUserOutput> {
  return useDatabase()
    .selectFrom("credentials")
    .selectAll()
    .where("service", "=", service)
    .where("user_id", "=", user_id)
    .executeTakeFirst();
}

export async function find_by_service({
  service,
  service_id,
}: FindByServiceInput): Promise<FindByServiceOutput> {
  return useDatabase()
    .selectFrom("credentials")
    .selectAll()
    .where("service", "=", service)
    .where("service_id", "=", service_id)
    .executeTakeFirst();
}

export async function find_all_by_user({
  user_id,
}: FindAllByUserInput): Promise<FindAllByUserOutput> {
  return useDatabase()
    .selectFrom("credentials")
    .select(["service", "service_id"])
    .where("user_id", "=", user_id)
    .execute();
}

export async function upsert({ data, options }: UpsertInput): Promise<UpsertOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("credentials")
    .values({ ...data, next_sync_at: sql<string>`now()` })
    .onConflict((oc) =>
      oc.columns(["service", "user_id"]).doUpdateSet({
        access_token: data.access_token,
        access_token_expires_at: data.access_token_expires_at,
        refresh_token: data.refresh_token,
        refresh_token_expires_at: data.refresh_token_expires_at,
        invalid_at: null,
        next_sync_at: sql<string>`now()`,
      }),
    )
    .execute();
}

export async function update_tokens({
  service,
  service_id,
  tokens,
  options,
}: UpdateTokensInput): Promise<UpdateTokensOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("credentials")
    .set(tokens)
    .where("service", "=", service)
    .where("service_id", "=", service_id)
    .execute();
}

export async function remove({ user_id, service, options }: RemoveInput): Promise<RemoveOutput> {
  const database = resolveDatabase(options);

  await database
    .deleteFrom("credentials")
    .where("user_id", "=", user_id)
    .where("service", "=", service)
    .execute();
}

export async function claim_due_sync({
  service,
  limit,
  lease_seconds,
}: ClaimDueSyncInput): Promise<ClaimDueSyncOutput> {
  return useDatabase()
    .updateTable("credentials")
    .set({ next_sync_at: sql<string>`now() + make_interval(secs => ${lease_seconds})` })
    .where("service", "=", service)
    .where("user_id", "in", (eb) =>
      eb
        .selectFrom("credentials")
        .select("user_id")
        .where("service", "=", service)
        .where("invalid_at", "is", null)
        .where("next_sync_at", "<=", sql<string>`now()`)
        .orderBy("next_sync_at")
        .limit(limit)
        .forUpdate()
        .skipLocked(),
    )
    .returning("user_id")
    .execute();
}

export async function reschedule_sync({
  service,
  user_id,
  next_sync_at,
}: RescheduleSyncInput): Promise<RescheduleSyncOutput> {
  await useDatabase()
    .updateTable("credentials")
    .set({ next_sync_at })
    .where("service", "=", service)
    .where("user_id", "=", user_id)
    .where("invalid_at", "is", null)
    .execute();
}

export async function mark_invalid({
  service,
  user_id,
}: MarkInvalidInput): Promise<MarkInvalidOutput> {
  await useDatabase()
    .updateTable("credentials")
    .set({ invalid_at: new Date(), next_sync_at: null })
    .where("service", "=", service)
    .where("user_id", "=", user_id)
    .execute();
}
