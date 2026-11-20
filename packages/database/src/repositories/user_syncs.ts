import { sql } from "kysely";

import type {
  FindInput,
  FindOutput,
  FinishInput,
  FinishOutput,
  StartInput,
  StartOutput,
} from "../../types/user_syncs";
import { resolveDatabase, useDatabase } from "../database";

export async function start({ user_id, stale_after_seconds }: StartInput): Promise<StartOutput> {
  const row = await useDatabase()
    .insertInto("user_syncs")
    .values({ user_id, started_at: sql<string>`now()` })
    .onConflict((oc) =>
      oc
        .column("user_id")
        .doUpdateSet({ started_at: sql<string>`now()`, finished_at: null, error: null })
        .where((eb) =>
          eb.or([
            eb("user_syncs.finished_at", "is not", null),
            eb(
              "user_syncs.started_at",
              "<",
              sql<string>`now() - make_interval(secs => ${stale_after_seconds})`,
            ),
          ]),
        ),
    )
    .returning("user_id")
    .executeTakeFirst();

  return !!row;
}

export async function finish({ user_id, error, options }: FinishInput): Promise<FinishOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("user_syncs")
    .set({ finished_at: sql<string>`now()`, error })
    .where("user_id", "=", user_id)
    .execute();
}

export async function find({ user_id }: FindInput): Promise<FindOutput> {
  return useDatabase()
    .selectFrom("user_syncs")
    .select(["started_at", "finished_at", "error"])
    .where("user_id", "=", user_id)
    .executeTakeFirst();
}
