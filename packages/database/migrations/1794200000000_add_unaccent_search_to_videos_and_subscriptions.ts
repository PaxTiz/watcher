import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS unaccent`.execute(db);

  // unaccent() is only STABLE: an IMMUTABLE wrapper is required to use it in indexes
  await sql`
    CREATE FUNCTION f_unaccent(text) RETURNS text
      LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
      AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$
  `.execute(db);

  // Language-agnostic full-text configuration ignoring accents: titles can be in any language, so
  // there's no stemming. Prefix matching (search_query) and trigrams make up for it.
  await sql`CREATE TEXT SEARCH CONFIGURATION simple_unaccent (COPY = simple)`.execute(db);
  await sql`
    ALTER TEXT SEARCH CONFIGURATION simple_unaccent
      ALTER MAPPING FOR hword, hword_part, word WITH unaccent, simple
  `.execute(db);

  await sql`
    CREATE FUNCTION search_vector(text) RETURNS tsvector
      LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
      AS $$ SELECT to_tsvector('simple_unaccent', $1) $$
  `.execute(db);

  // Every term of the query is matched as a prefix ("deve" matches "développer" and "developer"),
  // all terms are required
  await sql`
    CREATE FUNCTION search_query(text) RETURNS tsquery
      LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
      AS $$
        SELECT to_tsquery('simple_unaccent', string_agg(term || ':*', ' & '))
        FROM regexp_split_to_table($1, '[^[:alnum:]]+') AS term
        WHERE term <> ''
      $$
  `.execute(db);

  await db.schema.dropIndex("videos_title_search_idx").execute();
  await db.schema.dropIndex("videos_title_trgm_idx").execute();
  await db.schema.alterTable("videos").dropColumn("title_search").execute();

  // Title weighs more than the description, which is truncated as it's mostly links and sponsors
  await db.schema
    .alterTable("videos")
    .addColumn("search", sql`tsvector`, (col) =>
      col
        .generatedAlwaysAs(
          sql`setweight(search_vector(title), 'A') || setweight(search_vector(left(description, 500)), 'B')`,
        )
        .stored(),
    )
    .execute();
  await db.schema
    .createIndex("videos_search_idx")
    .on("videos")
    .using("gin")
    .column("search")
    .execute();

  await db.schema
    .createIndex("videos_title_unaccent_trgm_idx")
    .on("videos")
    .using("gin")
    .column(sql`f_unaccent(lower(title)) gin_trgm_ops`)
    .execute();

  await db.schema
    .createIndex("subscriptions_name_unaccent_trgm_idx")
    .on("subscriptions")
    .using("gin")
    .column(sql`f_unaccent(lower(name)) gin_trgm_ops`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("subscriptions_name_unaccent_trgm_idx").execute();
  await db.schema.dropIndex("videos_title_unaccent_trgm_idx").execute();
  await db.schema.dropIndex("videos_search_idx").execute();
  await db.schema.alterTable("videos").dropColumn("search").execute();

  await db.schema
    .alterTable("videos")
    .addColumn("title_search", sql`tsvector`, (col) =>
      col.generatedAlwaysAs(sql`to_tsvector('french', title)`).stored(),
    )
    .execute();

  await db.schema
    .createIndex("videos_title_search_idx")
    .on("videos")
    .using("gin")
    .column("title_search")
    .execute();

  await db.schema
    .createIndex("videos_title_trgm_idx")
    .on("videos")
    .using("gin")
    .column(sql`title gin_trgm_ops`)
    .execute();

  await sql`DROP FUNCTION search_query(text)`.execute(db);
  await sql`DROP FUNCTION search_vector(text)`.execute(db);
  await sql`DROP TEXT SEARCH CONFIGURATION simple_unaccent`.execute(db);
  await sql`DROP FUNCTION f_unaccent(text)`.execute(db);
  await sql`DROP EXTENSION IF EXISTS unaccent`.execute(db);
}
