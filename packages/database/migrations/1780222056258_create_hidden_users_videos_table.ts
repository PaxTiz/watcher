import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("hidden_users_videos")
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("video_id", "uuid", (col) =>
      col.notNull().references("videos.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .alterTable("hidden_users_videos")
    .addUniqueConstraint("unique_user_video", ["user_id", "video_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("hidden_users_videos").dropConstraint("unique_user_video").execute();

  await db.schema.dropTable("hidden_users_videos").execute();
}
