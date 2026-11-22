import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`UPDATE videos SET ready_at = now() WHERE ready_at IS NULL`.execute(db);

  await db.schema.dropTable("pending_video_images").execute();
  await db.schema.dropTable("pending_videos").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("pending_videos")
    .addColumn("service", "varchar", (c) => c.notNull())
    .addColumn("service_id", "varchar", (c) => c.notNull())
    .addColumn("subscription_id", "uuid", (c) =>
      c.notNull().references("subscriptions.id").onDelete("cascade"),
    )
    .addColumn("content_type", "varchar", (c) => c.notNull())
    .addColumn("discovered_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("next_attempt_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("attempts", "integer", (c) => c.notNull().defaultTo(0))
    .addPrimaryKeyConstraint("pending_videos_pkey", ["service", "service_id"])
    .execute();

  await db.schema
    .createIndex("pending_videos_service_next_attempt_at_idx")
    .on("pending_videos")
    .columns(["service", "next_attempt_at"])
    .execute();

  await db.schema
    .createTable("pending_video_images")
    .addColumn("video_id", "uuid", (c) =>
      c.primaryKey().references("videos.id").onDelete("cascade"),
    )
    .addColumn("next_attempt_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("attempts", "integer", (c) => c.notNull().defaultTo(0))
    .execute();

  await db.schema
    .createIndex("pending_video_images_next_attempt_at_idx")
    .on("pending_video_images")
    .column("next_attempt_at")
    .execute();
}
