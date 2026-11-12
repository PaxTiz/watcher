import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("videos")
    .addColumn("thumbnail_large_source", "varchar", (col) => col.notNull().defaultTo(""))
    .execute();

  await db.schema
    .alterTable("videos")
    .alterColumn("thumbnail_large_source", (col) => col.dropDefault())
    .execute();

  await db
    .updateTable("videos")
    .set({
      thumbnail_large_source: sql`'https://i.ytimg.com/vi/' || service_id || '/maxresdefault.jpg'`,
    })
    .where("service", "=", "youtube")
    .execute();

  await db
    .updateTable("videos")
    .set({
      thumbnail_small: sql`regexp_replace(thumbnail_small, '\\.jpg$', '')`,
      thumbnail_large: "",
    })
    .execute();

  await db
    .updateTable("subscriptions")
    .set({ logo: sql`regexp_replace(logo, '\\.jpg$', '')` })
    .execute();

  await db.schema.alterTable("videos").dropColumn("thumbnail_large_etag").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("videos")
    .addColumn("thumbnail_large_etag", "varchar", (col) => col.notNull().defaultTo(""))
    .execute();

  await db.schema
    .alterTable("videos")
    .alterColumn("thumbnail_large_etag", (col) => col.dropDefault())
    .execute();

  await db
    .updateTable("subscriptions")
    .set({ logo: sql`logo || '.jpg'` })
    .where("logo", "!=", "")
    .execute();

  await db
    .updateTable("videos")
    .set({
      thumbnail_small: sql`thumbnail_small || '.jpg'`,
      thumbnail_large: sql`thumbnail_small || '.jpg'`,
    })
    .where("thumbnail_small", "!=", "")
    .execute();

  await db.schema.alterTable("videos").dropColumn("thumbnail_large_source").execute();
}
