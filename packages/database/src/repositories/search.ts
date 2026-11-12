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
    .leftJoin("subscriptions as guest_channel", "guest_channel.id", "videos_guests.subscription_id")
    .leftJoin("user_subscriptions as guest_follow", (join) =>
      join
        .onRef("guest_follow.subscription_id", "=", "guest_channel.id")
        .on("guest_follow.user_id", "=", user_id)
        .on("guest_follow.is_hidden", "=", false),
    )
    .select(({ fn }) => [
      "videos_guests.key",
      sql<string>`coalesce(
        max(guest_channel.name) FILTER (WHERE guest_follow.user_id IS NOT NULL),
        mode() WITHIN GROUP (ORDER BY videos_guests.name)
      )`.as("name"),
      sql<
        string | null
      >`max(guest_channel.logo) FILTER (WHERE guest_follow.user_id IS NOT NULL)`.as("logo"),
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
    database.selectFrom("subscriptions").select(["id", "name"]).execute(),
    database
      .selectFrom("videos_guests")
      .select(({ fn }) => ["key", "name", fn.countAll<number>().as("videos_count")])
      .groupBy(["key", "name"])
      .execute(),
  ]);

  return {
    channels,
    guests: guests.map((guest) => ({ ...guest, videos_count: Number(guest.videos_count) })),
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
    video.guests.map((guest) => ({
      service_id: video.service_id,
      key: guest.key,
      name: guest.name,
      subscription_id: guest.subscription_id ?? null,
    })),
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
      INSERT INTO videos_guests (video_id, key, name, subscription_id)
      SELECT videos.id, guests.key, guests.name, guests.subscription_id
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
        AS guests(service_id text, key text, name text, subscription_id uuid)
      INNER JOIN videos ON videos.service = ${service} AND videos.service_id = guests.service_id
    `.execute(database);
  });
}
