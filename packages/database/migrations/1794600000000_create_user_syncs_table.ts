import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user_syncs")
    .addColumn("user_id", "uuid", (c) => c.primaryKey().references("users.id").onDelete("cascade"))
    .addColumn("started_at", "timestamptz", (c) => c.notNull())
    .addColumn("finished_at", "timestamptz")
    .addColumn("error", "varchar")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_syncs").execute();
}
