import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE users_videos_progression AS progression
    SET progression = CASE
      WHEN progression.progression >= 1 THEN videos.duration
      ELSE LEAST(ROUND(progression.progression * videos.duration), videos.duration)
    END
    FROM videos
    WHERE videos.id = progression.video_id
  `.execute(db);

  await sql`
    ALTER TABLE users_videos_progression
    ALTER COLUMN progression TYPE integer USING ROUND(progression)::integer
  `.execute(db);

  await db.schema
    .alterTable("users_videos_progression")
    .renameColumn("progression", "position")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("users_videos_progression")
    .renameColumn("position", "progression")
    .execute();

  await sql`
    ALTER TABLE users_videos_progression
    ALTER COLUMN progression TYPE float4
  `.execute(db);

  await sql`
    UPDATE users_videos_progression AS progression
    SET progression = CASE
      WHEN progression.progression >= videos.duration THEN 1
      ELSE COALESCE(progression.progression / NULLIF(videos.duration, 0), 0)
    END
    FROM videos
    WHERE videos.id = progression.video_id
  `.execute(db);
}
