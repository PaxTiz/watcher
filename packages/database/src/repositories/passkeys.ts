import type {
  CountByUserInput,
  CountByUserOutput,
  CreateInput,
  CreateOutput,
  FindAllByUserInput,
  FindAllByUserOutput,
  FindByIdInput,
  FindByIdOutput,
  MarkAsUsedInput,
  MarkAsUsedOutput,
  RemoveInput,
  RemoveOutput,
  RenameInput,
  RenameOutput,
} from "../../types/passkeys";
import { resolveDatabase, useDatabase } from "../database";

export async function find_all_by_user({
  user_id,
}: FindAllByUserInput): Promise<FindAllByUserOutput> {
  return useDatabase()
    .selectFrom("passkeys")
    .select(["id", "name", "backed_up", "created_at", "last_used_at"])
    .where("user_id", "=", user_id)
    .orderBy("created_at", "desc")
    .execute();
}

export async function find_by_id({ id }: FindByIdInput): Promise<FindByIdOutput> {
  return useDatabase().selectFrom("passkeys").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function count_by_user({ user_id }: CountByUserInput): Promise<CountByUserOutput> {
  const { count } = await useDatabase()
    .selectFrom("passkeys")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("user_id", "=", user_id)
    .executeTakeFirstOrThrow();

  return Number(count);
}

export async function create({ data, options }: CreateInput): Promise<CreateOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("passkeys")
    .values({ ...data, transports: JSON.stringify(data.transports) })
    .execute();
}

export async function mark_as_used({
  id,
  counter,
  options,
}: MarkAsUsedInput): Promise<MarkAsUsedOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("passkeys")
    .set({ counter, last_used_at: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
}

export async function rename({ id, user_id, name, options }: RenameInput): Promise<RenameOutput> {
  const database = resolveDatabase(options);

  const result = await database
    .updateTable("passkeys")
    .set({ name })
    .where("user_id", "=", user_id)
    .where("id", "=", id)
    .executeTakeFirst();

  return result.numUpdatedRows > 0n;
}

export async function remove({ id, user_id, options }: RemoveInput): Promise<RemoveOutput> {
  const database = resolveDatabase(options);

  const result = await database
    .deleteFrom("passkeys")
    .where("user_id", "=", user_id)
    .where("id", "=", id)
    .executeTakeFirst();

  return result.numDeletedRows > 0n;
}
