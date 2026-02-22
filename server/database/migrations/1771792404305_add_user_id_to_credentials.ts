import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("credentials")
    .addColumn("user_id", "varchar", (c) => c.notNull().unique())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").dropColumn("user_id").execute();
}
