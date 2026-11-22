import { sql } from "kysely";

import type {
  AddInput,
  AddOutput,
  RemoveOlderThanInput,
  RemoveOlderThanOutput,
  TotalsInput,
  TotalsOutput,
} from "../../types/external_requests";
import { resolveDatabase, useDatabase } from "../database";

export async function add({ hour, counts, options }: AddInput): Promise<AddOutput> {
  if (counts.length === 0) {
    return;
  }

  await resolveDatabase(options)
    .insertInto("external_requests")
    .values(counts.map((count) => ({ hour, ...count })))
    .onConflict((oc) =>
      oc.columns(["hour", "name"]).doUpdateSet((eb) => ({
        requests: sql<number>`external_requests.requests + ${eb.ref("excluded.requests")}`,
        failures: sql<number>`external_requests.failures + ${eb.ref("excluded.failures")}`,
        rate_limited: sql<number>`external_requests.rate_limited + ${eb.ref("excluded.rate_limited")}`,
      })),
    )
    .execute();
}

export async function totals({ since }: TotalsInput): Promise<TotalsOutput> {
  const rows = await useDatabase()
    .selectFrom("external_requests")
    .select((eb) => [
      "name",
      eb.fn.sum<string>("requests").as("requests"),
      eb.fn.sum<string>("failures").as("failures"),
      eb.fn.sum<string>("rate_limited").as("rate_limited"),
    ])
    .where("hour", ">=", since)
    .groupBy("name")
    .orderBy("name")
    .execute();

  return rows.map((row) => ({
    name: row.name,
    requests: Number(row.requests),
    failures: Number(row.failures),
    rate_limited: Number(row.rate_limited),
  }));
}

export async function remove_older_than({
  before,
  options,
}: RemoveOlderThanInput): Promise<RemoveOlderThanOutput> {
  const result = await resolveDatabase(options)
    .deleteFrom("external_requests")
    .where("hour", "<", before)
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
