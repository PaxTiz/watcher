import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subscriptions")
    .addColumn("last_synced_at", "timestamptz", (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("subscriptions").dropColumn("last_synced_at").execute();
}
