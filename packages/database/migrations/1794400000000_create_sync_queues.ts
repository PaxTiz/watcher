import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("subscriptions_sync")
    .addColumn("subscription_id", "uuid", (c) =>
      c.primaryKey().references("subscriptions.id").onDelete("cascade"),
    )
    .addColumn("service", "varchar", (c) => c.notNull())
    .addColumn("next_check_at", "timestamptz")
    .addColumn("checked_at", "timestamptz")
    .addColumn("last_video_at", "timestamptz")
    .addColumn("failures", "integer", (c) => c.notNull().defaultTo(0))
    .execute();

  await db.schema
    .createIndex("subscriptions_sync_service_next_check_at_idx")
    .on("subscriptions_sync")
    .columns(["service", "next_check_at"])
    .where("next_check_at", "is not", null)
    .execute();

  // The first checks are spread over an hour, channels without followers are never checked
  await sql`
    INSERT INTO subscriptions_sync (subscription_id, service, next_check_at, last_video_at)
    SELECT
      s.id,
      s.service,
      CASE
        WHEN EXISTS (SELECT 1 FROM user_subscriptions us WHERE us.subscription_id = s.id)
        THEN now() + random() * interval '1 hour'
      END,
      (SELECT max(v.created_at) FROM videos v WHERE v.service = s.service AND v.subscription_id = s.service_id)
    FROM subscriptions s
    WHERE s.service = 'youtube'
  `.execute(db);

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

  await db.schema
    .alterTable("videos")
    .addColumn("ready_at", "timestamptz", (c) => c.defaultTo(sql`now()`))
    .addColumn("content_type", "varchar", (c) => c.notNull().defaultTo("video"))
    .addColumn("checked_at", "timestamptz")
    .execute();

  await db.schema.alterTable("credentials").addColumn("invalid_at", "timestamptz").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("credentials").dropColumn("invalid_at").execute();

  await db.schema
    .alterTable("videos")
    .dropColumn("ready_at")
    .dropColumn("content_type")
    .dropColumn("checked_at")
    .execute();

  await db.schema.dropTable("pending_video_images").execute();
  await db.schema.dropTable("pending_videos").execute();
  await db.schema.dropTable("subscriptions_sync").execute();
}
