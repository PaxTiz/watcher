import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subscriptions")
    .addColumn("logo_etag", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable("videos")
    .addColumn("thumbnail_small_etag", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable("videos")
    .addColumn("thumbnail_large_etag", "varchar", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("subscriptions").dropColumn("logo_etag").execute();
  await db.schema.alterTable("videos").dropColumn("thumbnail_small_etag").execute();
  await db.schema.alterTable("videos").dropColumn("thumbnail_large_etag").execute();
}
