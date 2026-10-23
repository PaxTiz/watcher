import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("videos")
    .addColumn("service_id", "varchar", (c) => c.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("videos").dropColumn("service_id").execute();
}
