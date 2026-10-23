import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subscriptions")
    .addUniqueConstraint("unique_service_service_id", ["service", "service_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("subscriptions").dropConstraint("unique_service_service_id").execute();
}
