import type {
  CreateInput,
  CreateOutput,
  FindByCredentialInput,
  FindByCredentialOutput,
  FindByIdInput,
  FindByIdOutput,
  MarkAsOnboardedInput,
  MarkAsOnboardedOutput,
  RemoveInput,
  RemoveOutput,
  UpdateInput,
  UpdateOutput,
} from "../../types/users";
import { resolveDatabase, useDatabase } from "../database";

export async function find_by_id({ id, options }: FindByIdInput): Promise<FindByIdOutput> {
  const database = resolveDatabase(options);

  return database.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function find_by_credential({
  service,
  service_id,
}: FindByCredentialInput): Promise<FindByCredentialOutput> {
  return useDatabase()
    .selectFrom("users")
    .selectAll("users")
    .innerJoin("credentials", "users.id", "credentials.user_id")
    .where("credentials.service", "=", service)
    .where("credentials.service_id", "=", service_id)
    .executeTakeFirst();
}

export async function create({ data, options }: CreateInput): Promise<CreateOutput> {
  const database = resolveDatabase(options);

  return database
    .insertInto("users")
    .values({ name: data.name, is_onboarded: false })
    .onConflict((oc) => oc.doNothing())
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function update({ id, data, options }: UpdateInput): Promise<UpdateOutput> {
  const database = resolveDatabase(options);

  await database.updateTable("users").set(data).where("id", "=", id).execute();
}

export async function mark_as_onboarded({
  id,
  options,
}: MarkAsOnboardedInput): Promise<MarkAsOnboardedOutput> {
  const database = resolveDatabase(options);

  await database.updateTable("users").set({ is_onboarded: true }).where("id", "=", id).execute();
}

export async function remove({ id, options }: RemoveInput): Promise<RemoveOutput> {
  const database = resolveDatabase(options);

  await database.deleteFrom("users").where("id", "=", id).execute();
}
