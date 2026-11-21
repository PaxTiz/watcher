import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subscriptions_sync")
    .addColumn("websub_renew_at", "timestamptz")
    .addColumn("websub_expires_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("subscriptions_sync_service_websub_renew_at_idx")
    .on("subscriptions_sync")
    .columns(["service", "websub_renew_at"])
    .where("websub_renew_at", "is not", null)
    .execute();

  await sql`
    UPDATE subscriptions_sync
    SET websub_renew_at = now() + random() * interval '1 day'
    WHERE service = 'youtube' AND next_check_at IS NOT NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subscriptions_sync")
    .dropColumn("websub_renew_at")
    .dropColumn("websub_expires_at")
    .execute();
}
