import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("credentials")
    .addColumn("service", "varchar", (c) => c.primaryKey())
    .addColumn("access_token", "varchar", (c) => c.notNull())
    .addColumn("refresh_token", "varchar", (c) => c.notNull())
    .addColumn("expires_at", "timestamptz", (c) => c.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("credentials").execute();
}
