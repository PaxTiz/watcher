import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`UUIDV7()`))
    .addColumn("name", "varchar", (c) => c.notNull())
    .addColumn("bluesky_did", "varchar", (c) => c.notNull().unique())
    .addColumn("bluesky_handle", "varchar", (c) => c.notNull().unique())
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("last_login_at", "timestamptz", (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
