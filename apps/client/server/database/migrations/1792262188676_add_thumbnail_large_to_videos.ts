import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("videos").renameColumn("thumbnail", "thumbnail_small").execute();
  await db.schema
    .alterTable("videos")
    .addColumn("thumbnail_large", "varchar", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("videos").dropColumn("thumbnail_large").execute();
  await db.schema.alterTable("videos").renameColumn("thumbnail_small", "thumbnail").execute();
}
