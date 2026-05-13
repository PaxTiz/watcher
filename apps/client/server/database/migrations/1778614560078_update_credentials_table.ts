import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("credentials")
    .dropColumn("expires_at")
    .dropColumn("user_id")
    .addColumn("access_token_expires_at", "timestamptz", (c) => c.notNull())
    .addColumn("refresh_token_expires_at", "timestamptz", (c) => c.notNull())
    .addColumn("service_id", "varchar", (c) => c.notNull())
    .addColumn("user_id", "uuid", (c) => c.notNull().references("users.id").onDelete("cascade"))
    .execute();

  await db.schema
    .alterTable("credentials")
    .addUniqueConstraint("service_user_id", ["service", "user_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").dropConstraint("service_user_id").execute();

  await db.schema
    .alterTable("credentials")
    .dropColumn("access_token_expires_at")
    .dropColumn("refresh_token_expires_at")
    .dropColumn("service_id")
    .dropColumn("user_id")
    .execute();
}
