import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("credentials")
    .addUniqueConstraint("credentials_service_service_id_unique", ["service", "service_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("credentials")
    .dropConstraint("credentials_service_service_id_unique")
    .execute();
}
