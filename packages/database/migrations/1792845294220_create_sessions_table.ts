import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("sessions")
    // Random (v4) rather than time-ordered: the id is the session's only secret server side
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("user_id", "uuid", (c) => c.notNull().references("users.id").onDelete("cascade"))
    .addColumn("login_with", "varchar", (c) => c.notNull())
    .addColumn("login_with_id", "varchar", (c) => c.notNull())
    .addColumn("user_agent", "varchar")
    .addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("expires_at", "timestamptz", (c) => c.notNull())
    .addColumn("last_seen_at", "timestamptz", (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema.createIndex("sessions_user_id_index").on("sessions").column("user_id").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("sessions").execute();
}
