import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("videos")
    .addColumn("title_search", sql`tsvector`, (col) =>
      col.generatedAlwaysAs(sql`to_tsvector('english', title)`).stored(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("videos").dropColumn("title_search").execute();
}
