import { type ExpressionBuilder, sql } from "kysely";

import type {
  FindChannelsInput,
  FindChannelsOutput,
  FindGuestsInput,
  FindGuestsOutput,
  FindKnownPeopleOutput,
  FindVideosInput,
  FindVideosOutput,
  ReplaceGuestsInput,
  ReplaceGuestsOutput,
  SearchVideosFilters,
} from "../../types/search";
import { type DatabaseInterface, useDatabase, withResolvedTransaction } from "../database";
import { escape_like } from "../helpers";
import {
  select_subscriptions_with_user_state,
  select_video_row,
  select_visible_videos_for_user,
  video_search_score,
} from "../queries";

function featuring_all(guests: Array<string>) {
  return (eb: ExpressionBuilder<DatabaseInterface, "videos">) =>
    eb.and(
      guests.map((key) =>
        eb.exists(
          eb
            .selectFrom("videos_guests")
            .whereRef("videos_guests.video_id", "=", "videos.id")
            .where("videos_guests.key", "=", key),
        ),
      ),
    );
}

function select_matching_videos(
  user_id: string,
  query: string | undefined,
  filters: SearchVideosFilters,
) {
  return select_visible_videos_for_user(user_id, { query, duration: filters.duration }).$if(
    !!filters.guests?.length,
    (qb) => qb.where(featuring_all(filters.guests!)),
  );
}

export async function find_channels({
  user_id,
  query,
  limit,
}: FindChannelsInput): Promise<FindChannelsOutput> {
  return select_subscriptions_with_user_state(user_id)
    .where(
      sql<boolean>`(
        f_unaccent(lower(subscriptions.name)) LIKE '%' || f_unaccent(lower(${escape_like(query)})) || '%'
        OR f_unaccent(lower(${query})) <% f_unaccent(lower(subscriptions.name))
      )`,
    )
    .orderBy(
      sql`word_similarity(f_unaccent(lower(${query})), f_unaccent(lower(subscriptions.name)))`,
      "desc",
    )
    .orderBy("user_subscriptions.is_hidden", "asc")
    .orderBy("subscriptions.name", "asc")
    .limit(limit)
    .execute();
}

export async function find_videos({
  user_id,
  query,
  filters,
  sort,
  limit,
}: FindVideosInput): Promise<FindVideosOutput> {
  return select_matching_videos(user_id, query, filters)
    .leftJoin("users_videos_progression", (qb) =>
      qb
        .onRef("users_videos_progression.video_id", "=", "videos.id")
        .on("users_videos_progression.user_id", "=", user_id),
    )
    .$if(!!query && sort === "relevance", (qb) => qb.orderBy(video_search_score(query!), "desc"))
    .orderBy("videos.created_at", "desc")
    .orderBy("videos.id", "desc")
    .limit(limit)
    .select(select_video_row(user_id))
    .execute();
}

export async function find_guests({
  user_id,
  query,
  filters,
  limit,
}: FindGuestsInput): Promise<FindGuestsOutput> {
  const rows = await select_matching_videos(user_id, query, filters)
    .innerJoin("videos_guests", "videos_guests.video_id", "videos.id")
    .select(({ fn }) => [
      "videos_guests.key",
      sql<string>`mode() WITHIN GROUP (ORDER BY videos_guests.name)`.as("name"),
      fn.countAll<number>().as("videos_count"),
    ])
    .groupBy("videos_guests.key")
    .orderBy("videos_count", "desc")
    .orderBy("videos_guests.key")
    .limit(limit)
    .execute();

  return rows.map((row) => ({ ...row, videos_count: Number(row.videos_count) }));
}

export async function find_known_people(): Promise<FindKnownPeopleOutput> {
  const database = useDatabase();

  const [channels, guests] = await Promise.all([
    database.selectFrom("subscriptions").select("name").execute(),
    database.selectFrom("videos_guests").select("key").distinct().execute(),
  ]);

  return {
    channel_names: channels.map((channel) => channel.name),
    guest_keys: guests.map((guest) => guest.key),
  };
}

export async function replace_guests({
  service,
  videos,
  options,
}: ReplaceGuestsInput): Promise<ReplaceGuestsOutput> {
  if (videos.length === 0) {
    return;
  }

  const service_ids = videos.map((video) => video.service_id);
  const rows = videos.flatMap((video) =>
    video.guests.map((guest) => ({ service_id: video.service_id, ...guest })),
  );

  await withResolvedTransaction(options, async (database) => {
    await database
      .deleteFrom("videos_guests")
      .where("video_id", "in", (eb) =>
        eb
          .selectFrom("videos")
          .select("id")
          .where("service", "=", service)
          .where("service_id", "in", service_ids),
      )
      .execute();

    if (rows.length === 0) {
      return;
    }

    await sql`
      INSERT INTO videos_guests (video_id, key, name)
      SELECT videos.id, guests.key, guests.name
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS guests(service_id text, key text, name text)
      INNER JOIN videos ON videos.service = ${service} AND videos.service_id = guests.service_id
    `.execute(database);
  });
}
