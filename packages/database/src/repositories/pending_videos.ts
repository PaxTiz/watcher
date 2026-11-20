import type {
  AddManyInput,
  AddManyOutput,
  FindKnownInput,
  FindKnownOutput,
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
