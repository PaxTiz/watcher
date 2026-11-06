import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").dropConstraint("credentials_pkey").execute();
  await db.schema.alterTable("credentials").dropConstraint("service_user_id").execute();

  await db.schema
    .alterTable("credentials")
    .addPrimaryKeyConstraint("credentials_pkey", ["service", "user_id"])
    .execute();
}

// Fails as soon as two users have linked the same service: the old key only allowed one row each
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").dropConstraint("credentials_pkey").execute();

  await db.schema
    .alterTable("credentials")
    .addUniqueConstraint("service_user_id", ["service", "user_id"])
    .execute();

  await db.schema
    .alterTable("credentials")
    .addPrimaryKeyConstraint("credentials_pkey", ["service"])
    .execute();
}
