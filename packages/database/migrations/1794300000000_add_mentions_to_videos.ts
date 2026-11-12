import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE FUNCTION extract_mentions(text) RETURNS text[]
      LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
      AS $$
        SELECT coalesce(array_agg(DISTINCT mention), '{}')
        FROM (
          SELECT rtrim(lower(match[2]), '.-') AS mention
          FROM regexp_matches($1, '(^|[^[:alnum:]_.])@([[:alnum:]_.-]+)', 'g') AS match
        ) AS mentions
        WHERE length(mention) >= 3
      $$
  `.execute(db);

  await db.schema
    .alterTable("videos")
    .addColumn("mentions", sql`text[]`, (col) =>
      col
        .generatedAlwaysAs(sql`extract_mentions(title)`)
        .stored()
        .notNull(),
    )
    .execute();

  await db.schema
    .createIndex("videos_mentions_idx")
    .on("videos")
    .using("gin")
    .column("mentions")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("videos_mentions_idx").execute();
  await db.schema.alterTable("videos").dropColumn("mentions").execute();
  await sql`DROP FUNCTION extract_mentions(text)`.execute(db);
}
