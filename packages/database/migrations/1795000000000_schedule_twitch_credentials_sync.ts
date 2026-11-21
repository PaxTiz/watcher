import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable("credentials")
    .set({ next_sync_at: sql`now() + random() * interval '1 day'` })
    .where("service", "=", "twitch")
    .where("invalid_at", "is", null)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable("credentials")
    .set({ next_sync_at: null })
    .where("service", "=", "twitch")
    .execute();
}
