import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("sessions")
    .addColumn("authenticated_at", "timestamptz", (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  await db
    .updateTable("sessions")
    .set({ authenticated_at: sql`created_at` })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("sessions").dropColumn("authenticated_at").execute();
}
