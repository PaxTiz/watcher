import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("videos").addColumn("palette", "jsonb").execute();
  await db.schema.alterTable("videos").dropColumn("color").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("videos").addColumn("color", "varchar(7)").execute();
  await db.schema.alterTable("videos").dropColumn("palette").execute();
}
