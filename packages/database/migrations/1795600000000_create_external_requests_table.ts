import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("external_requests")
    .addColumn("hour", "timestamptz", (c) => c.notNull())
    .addColumn("name", "varchar", (c) => c.notNull())
    .addColumn("requests", "integer", (c) => c.notNull())
    .addColumn("failures", "integer", (c) => c.notNull())
    .addColumn("rate_limited", "integer", (c) => c.notNull())
    .addPrimaryKeyConstraint("external_requests_pkey", ["hour", "name"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("external_requests").execute();
}
