import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable("videos")
    .set({
      thumbnail_large: sql`replace(thumbnail_large, '_small.jpg', '_large.jpg')`,
      palette: null,
    })
    .where("service", "=", "youtube")
    .where("thumbnail_large", "like", "%\\_small.jpg")
    .execute();
}

export async function down(_db: Kysely<any>): Promise<void> {}
