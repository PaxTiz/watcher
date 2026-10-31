import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("rate_limits")
    .addColumn("type", "varchar", (c) => c.notNull())
    .addColumn("key", "varchar", (c) => c.notNull())
    .addColumn("attempts", "integer", (c) => c.notNull())
    .addColumn("expires_at", "timestamptz", (c) => c.notNull())
    .addPrimaryKeyConstraint("rate_limits_pkey", ["type", "key"])
    .execute();

  await db.schema
    .createIndex("rate_limits_expires_at_index")
    .on("rate_limits")
    .column("expires_at")
    .execute();

  await db.schema
    .createTable("webauthn_challenges")
    .addColumn("id", "varchar", (c) => c.primaryKey())
    .addColumn("challenge", "varchar", (c) => c.notNull())
    .addColumn("expires_at", "timestamptz", (c) => c.notNull())
    .execute();

  await db.schema
    .createIndex("webauthn_challenges_expires_at_index")
    .on("webauthn_challenges")
    .column("expires_at")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("webauthn_challenges").execute();
  await db.schema.dropTable("rate_limits").execute();
}
