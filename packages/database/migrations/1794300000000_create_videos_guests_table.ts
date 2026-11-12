import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("videos_guests")
    .addColumn("video_id", "uuid", (c) => c.notNull().references("videos.id").onDelete("cascade"))
    .addColumn("key", "varchar", (c) => c.notNull())
    .addColumn("name", "varchar", (c) => c.notNull())
    .addPrimaryKeyConstraint("videos_guests_pkey", ["video_id", "key"])
    .execute();

  await db.schema.createIndex("videos_guests_key_idx").on("videos_guests").column("key").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("videos_guests").execute();
}
