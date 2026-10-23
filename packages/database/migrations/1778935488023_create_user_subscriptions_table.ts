import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user_subscriptions")
    .addColumn("user_id", "uuid", (c) => c.notNull().references("users.id").onDelete("cascade"))
    .addColumn("subscription_id", "uuid", (c) =>
      c.notNull().references("subscriptions.id").onDelete("cascade"),
    )
    .addColumn("is_favorite", "boolean", (c) => c.notNull().defaultTo(false))
    .addUniqueConstraint("user_id_subscription_id_unique", ["user_id", "subscription_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_subscriptions").execute();
}
