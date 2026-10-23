import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("users").dropColumn("bluesky_did").execute();
  await db.schema.alterTable("users").dropColumn("bluesky_handle").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("users")
    .addColumn("bluesky_did", "varchar", (c) => c.unique())
    .execute();
  await db.schema
    .alterTable("users")
    .addColumn("bluesky_handle", "varchar", (c) => c.unique())
    .execute();
}
