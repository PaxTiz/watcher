import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex("users_videos_progression_video_id_idx")
    .on("users_videos_progression")
    .column("video_id")
    .execute();

  await db.schema
    .createIndex("hidden_users_videos_video_id_idx")
    .on("hidden_users_videos")
    .column("video_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("hidden_users_videos_video_id_idx").execute();
  await db.schema.dropIndex("users_videos_progression_video_id_idx").execute();
}
