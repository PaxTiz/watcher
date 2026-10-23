import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users_videos_progression")
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("video_id", "uuid", (col) =>
      col.notNull().references("videos.id").onDelete("cascade"),
    )
    .addColumn("progression", "float4", (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable("users_videos_progression")
    .addUniqueConstraint("unique_user_id_video_id", ["user_id", "video_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("users_videos_progression")
    .dropConstraint("unique_user_id_video_id")
    .execute();

  await db.schema.dropTable("users_videos_progression").execute();
}
