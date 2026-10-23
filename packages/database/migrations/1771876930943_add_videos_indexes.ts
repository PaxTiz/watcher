import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("videos")
    .addUniqueConstraint("videos_unique_service_service_id", ["service", "service_id"])
    .execute();

  await db.schema
    .createIndex("subscription_id_index")
    .on("videos")
    .column("subscription_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("subscription_id_index").execute();
  await db.schema.alterTable("videos").dropConstraint("videos_unique_service_service_id").execute();
}
