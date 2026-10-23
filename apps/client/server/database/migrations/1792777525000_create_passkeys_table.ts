import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("passkeys")
    .addColumn("id", "varchar", (c) => c.primaryKey())
    .addColumn("user_id", "uuid", (c) => c.notNull().references("users.id").onDelete("cascade"))
    .addColumn("name", "varchar", (c) => c.notNull())
    .addColumn("public_key", "text", (c) => c.notNull())
    .addColumn("counter", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("backed_up", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("transports", "jsonb", (c) => c.notNull().defaultTo(sql`'[]'::jsonb`))
    .addColumn("aaguid", "varchar")
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("last_used_at", "timestamptz")
    .execute();

  await db.schema.createIndex("passkeys_user_id_index").on("passkeys").column("user_id").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("passkeys").execute();
}
