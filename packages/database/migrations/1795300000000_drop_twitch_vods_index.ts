import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("subscriptions_sync_service_vods_due_at_idx").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex("subscriptions_sync_service_vods_due_at_idx")
    .on("subscriptions_sync")
    .columns(["service", "vods_due_at"])
    .where("vods_due_at", "is not", null)
    .execute();
}
