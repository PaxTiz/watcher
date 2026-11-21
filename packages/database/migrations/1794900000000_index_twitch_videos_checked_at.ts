import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE INDEX videos_twitch_checked_at_idx ON videos (checked_at NULLS FIRST)
    WHERE service = 'twitch'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("videos_twitch_checked_at_idx").execute();
}
