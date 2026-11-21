import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subscriptions_sync")
    .addColumn("live_stream_id", "varchar")
    .addColumn("vods_due_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("subscriptions_sync_service_vods_due_at_idx")
    .on("subscriptions_sync")
    .columns(["service", "vods_due_at"])
    .where("vods_due_at", "is not", null)
    .execute();

  await sql`
    INSERT INTO subscriptions_sync (subscription_id, service)
    SELECT s.id, s.service
    FROM subscriptions s
    WHERE s.service = 'twitch'
    ON CONFLICT (subscription_id) DO NOTHING
  `.execute(db);

  await sql`
    UPDATE subscriptions_sync ss
    SET
      next_check_at = CASE WHEN followed THEN now() + random() * interval '1 hour' END,
      vods_due_at = CASE WHEN followed THEN now() + random() * interval '1 day' END,
      websub_renew_at = NULL,
      last_video_at = (
        SELECT max(v.created_at) FROM videos v
        WHERE v.service = 'twitch' AND v.subscription_id = s.service_id
      )
    FROM subscriptions s,
      LATERAL (
        SELECT EXISTS (SELECT 1 FROM user_subscriptions us WHERE us.subscription_id = s.id) AS followed
      ) f
    WHERE ss.subscription_id = s.id AND s.service = 'twitch'
  `.execute(db);

  await sql`UPDATE videos SET content_type = 'live' WHERE service = 'twitch'`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`UPDATE videos SET content_type = 'video' WHERE service = 'twitch'`.execute(db);

  await sql`DELETE FROM subscriptions_sync WHERE service = 'twitch'`.execute(db);

  await db.schema
    .alterTable("subscriptions_sync")
    .dropColumn("live_stream_id")
    .dropColumn("vods_due_at")
    .execute();
}
