import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("videos_guests").where("subscription_id", "is", null).execute();

  await db.schema
    .alterTable("videos_guests")
    .dropConstraint("videos_guests_subscription_id_fkey")
    .execute();

  await db.schema
    .alterTable("videos_guests")
    .dropColumn("name")
    .alterColumn("subscription_id", (c) => c.setNotNull())
    .execute();

  await db.schema
    .alterTable("videos_guests")
    .addForeignKeyConstraint(
      "videos_guests_subscription_id_fkey",
      ["subscription_id"],
      "subscriptions",
      ["id"],
      (c) => c.onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("videos_guests_subscription_id_idx")
    .on("videos_guests")
    .column("subscription_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("videos_guests_subscription_id_idx").execute();

  await db.schema
    .alterTable("videos_guests")
    .dropConstraint("videos_guests_subscription_id_fkey")
    .execute();

  await db.schema
    .alterTable("videos_guests")
    .addColumn("name", "varchar")
    .alterColumn("subscription_id", (c) => c.dropNotNull())
    .execute();

  await db.schema
    .alterTable("videos_guests")
    .addForeignKeyConstraint(
      "videos_guests_subscription_id_fkey",
      ["subscription_id"],
      "subscriptions",
      ["id"],
      (c) => c.onDelete("set null"),
    )
    .execute();

  await sql`
    UPDATE videos_guests
    SET name = subscriptions.name
    FROM subscriptions
    WHERE subscriptions.id = videos_guests.subscription_id
  `.execute(db);

  await db.schema
    .alterTable("videos_guests")
    .alterColumn("name", (c) => c.setNotNull())
    .execute();
}
