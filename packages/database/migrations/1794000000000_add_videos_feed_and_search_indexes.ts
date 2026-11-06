import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("subscription_id_index").execute();
  await db.schema
    .createIndex("videos_subscription_created_at_idx")
    .on("videos")
    .columns(["service", "subscription_id", "created_at desc", "id desc"])
    .execute();

  await db.schema
    .createIndex("user_subscriptions_subscription_id_idx")
    .on("user_subscriptions")
    .column("subscription_id")
    .execute();

  await db.schema.alterTable("videos").dropColumn("title_search").execute();
  await db.schema
    .alterTable("videos")
    .addColumn("title_search", sql`tsvector`, (col) =>
      col.generatedAlwaysAs(sql`to_tsvector('french', title)`).stored(),
    )
    .execute();
  await db.schema
    .createIndex("videos_title_search_idx")
    .on("videos")
    .using("gin")
    .column("title_search")
    .execute();

  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  await db.schema
    .createIndex("videos_title_trgm_idx")
    .on("videos")
    .using("gin")
    .column(sql`title gin_trgm_ops`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("videos_title_trgm_idx").execute();
  await sql`DROP EXTENSION IF EXISTS pg_trgm`.execute(db);

  await db.schema.dropIndex("videos_title_search_idx").execute();
  await db.schema.alterTable("videos").dropColumn("title_search").execute();
  await db.schema
    .alterTable("videos")
    .addColumn("title_search", sql`tsvector`, (col) =>
      col.generatedAlwaysAs(sql`to_tsvector('english', title)`).stored(),
    )
    .execute();

  await db.schema.dropIndex("user_subscriptions_subscription_id_idx").execute();

  await db.schema.dropIndex("videos_subscription_created_at_idx").execute();
  await db.schema
    .createIndex("subscription_id_index")
    .on("videos")
    .column("subscription_id")
    .execute();
}
