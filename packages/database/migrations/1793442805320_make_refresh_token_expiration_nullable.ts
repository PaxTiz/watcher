import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("credentials")
    .alterColumn("refresh_token_expires_at", (col) => col.dropNotNull())
    .execute();

  await db
    .updateTable("credentials")
    .set({ refresh_token_expires_at: null })
    .where("service", "=", "twitch")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable("credentials")
    .set({ refresh_token_expires_at: sql`access_token_expires_at` })
    .where("refresh_token_expires_at", "is", null)
    .execute();

  await db.schema
    .alterTable("credentials")
    .alterColumn("refresh_token_expires_at", (col) => col.setNotNull())
    .execute();
}
