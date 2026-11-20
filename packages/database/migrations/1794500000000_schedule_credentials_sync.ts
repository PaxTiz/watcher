import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").addColumn("next_sync_at", "timestamptz").execute();

  await db.schema
    .createIndex("credentials_service_next_sync_at_idx")
    .on("credentials")
    .columns(["service", "next_sync_at"])
    .where("next_sync_at", "is not", null)
    .execute();

  await db
    .updateTable("credentials")
    .set({ next_sync_at: sql`now() + random() * interval '1 day'` })
    .where("service", "=", "google")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").dropColumn("next_sync_at").execute();
}
