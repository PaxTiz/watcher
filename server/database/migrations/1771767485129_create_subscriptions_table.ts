import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("subscriptions")
    .addColumn("id", "serial", (c) => c.primaryKey())
    .addColumn("service_id", "varchar", (c) => c.notNull())
    .addColumn("service", "varchar", (c) => c.notNull())
    .addColumn("url", "varchar", (c) => c.notNull())
    .addColumn("logo", "varchar", (c) => c.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("subscriptions").execute();
}
