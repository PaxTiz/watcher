import type {
  FindAllByUserInput,
  FindAllByUserOutput,
  FindByServiceInput,
  FindByServiceOutput,
  FindByUserInput,
  FindByUserOutput,
  RemoveInput,
  RemoveOutput,
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
    .values(data)
    .onConflict((oc) =>
      oc.columns(["service", "user_id"]).doUpdateSet({
        access_token: data.access_token,
        access_token_expires_at: data.access_token_expires_at,
        refresh_token: data.refresh_token,
        refresh_token_expires_at: data.refresh_token_expires_at,
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
