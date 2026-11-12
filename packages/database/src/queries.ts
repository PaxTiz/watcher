import { type ExpressionBuilder, sql } from "kysely";

import type { FindAllForUserFilters } from "../types/videos";
import { type DatabaseInterface, useDatabase } from "./database";
import { escape_like } from "./helpers";

// Queries shared between repositories (feed, channels, search). Internal to the package: not
// exported by its index.

// Language-agnostic: prefix full-text matching, trigram similarity to tolerate typos and substring
// matching for languages without spaces between words (Japanese, Chinese, …)
export function matches_video_search(query: string) {
  return sql<boolean>`(
    videos.search @@ search_query(${query})
    OR f_unaccent(lower(${query})) <% f_unaccent(lower(videos.title))
    OR f_unaccent(lower(videos.title)) LIKE '%' || f_unaccent(lower(${escape_like(query)})) || '%'
  )`;
}

// Relevance of a video for `query`. Deterministic, so it can also be computed for a pagination
// cursor's video.
export function video_search_score(query: string, table: "videos" | "cursor_video" = "videos") {
  return sql<number>`(
    coalesce(ts_rank_cd(${sql.ref(`${table}.search`)}, search_query(${query})), 0)
    + word_similarity(f_unaccent(lower(${query})), f_unaccent(lower(${sql.ref(`${table}.title`)})))
  )`;
}

// Videos visible to the user (followed and not hidden subscriptions, minus hidden and watched
// videos) matching `filters`.
// Shared by the feed (its count and its pages) and the search, so they always agree.
export function select_visible_videos_for_user(user_id: string, filters: FindAllForUserFilters) {
  return useDatabase()
    .selectFrom("videos")
    .innerJoin("subscriptions", (qb) =>
      qb
        .onRef("subscriptions.service_id", "=", "videos.subscription_id")
        .onRef("subscriptions.service", "=", "videos.service"),
    )
    .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
    .$if(filters.with_hidden !== true, (qb) =>
      qb.where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom("hidden_users_videos")
              .where("hidden_users_videos.video_id", "=", eb.ref("videos.id"))
              .where("hidden_users_videos.user_id", "=", eb.ref("user_subscriptions.user_id")),
          ),
        ),
      ),
    )
    .where("user_subscriptions.is_hidden", "=", false)
    .where("user_subscriptions.user_id", "=", user_id)
    .$if(!!filters.service, (qb) => qb.where("videos.service", "=", filters.service!))
    .$if(filters.is_favorite === true, (qb) =>
      qb.where("user_subscriptions.is_favorite", "=", true),
    )
    .$if(filters.duration === "less_than_10_minutes", (qb) =>
      qb.where("videos.duration", "<=", 60 * 10),
    )
    .$if(filters.duration === "between_10_30_minutes", (qb) =>
      qb.where("videos.duration", ">", 60 * 10).where("videos.duration", "<=", 60 * 30),
    )
    .$if(filters.duration === "between_30_60_minutes", (qb) =>
      qb.where("videos.duration", ">", 60 * 30).where("videos.duration", "<=", 60 * 60),
    )
    .$if(filters.duration === "greater_than_1_hour", (qb) =>
      qb.where("videos.duration", ">=", 60 * 60),
    )
    .$if(!!filters.created_after, (qb) =>
      qb.where("videos.created_at", ">=", filters.created_after!),
    )
    .$if(!!filters.created_before, (qb) =>
      qb.where("videos.created_at", "<=", filters.created_before!),
    )
    .$if(!!filters.subscription_id, (qb) =>
      qb.where("subscriptions.id", "=", filters.subscription_id!),
    )
    .$if(!!filters.query, (qb) => qb.where(matches_video_search(filters.query!)))
    .$if(filters.in_progress === true, (qb) =>
      qb.where((eb) =>
        eb.exists(
          eb
            .selectFrom("users_videos_progression as progression")
            .whereRef("progression.video_id", "=", "videos.id")
            .where("progression.user_id", "=", user_id)
            .where("progression.progression", ">", 0)
            .where("progression.progression", "<", 1),
        ),
      ),
    )
    .$if(filters.with_watched !== true, (qb) =>
      qb.where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom("users_videos_progression as watched")
              .whereRef("watched.video_id", "=", "videos.id")
              .where("watched.user_id", "=", user_id)
              .where("watched.progression", ">=", 1),
          ),
        ),
      ),
    );
}

// Columns of a `VideoRow`, for a query on `select_visible_videos_for_user` left joined with the
// user's `users_videos_progression`
export function select_video_row(user_id: string) {
  return (
    eb: ExpressionBuilder<
      DatabaseInterface,
      "videos" | "subscriptions" | "user_subscriptions" | "users_videos_progression"
    >,
  ) => [
    eb.ref("videos.id").as("video_id"),
    eb.ref("videos.service").as("video_service"),
    eb.ref("videos.title").as("video_title"),
    eb.ref("videos.duration").as("video_duration"),
    eb.ref("videos.url").as("video_url"),
    eb.ref("videos.thumbnail_small").as("video_thumbnail_small"),
    eb.ref("videos.thumbnail_large").as("video_thumbnail_large"),
    eb.ref("videos.palette").as("video_palette"),
    eb.ref("videos.created_at").as("video_created_at"),
    eb.ref("subscriptions.id").as("subscription_id"),
    eb.ref("subscriptions.name").as("subscription_name"),
    eb.ref("subscriptions.slug").as("subscription_slug"),
    eb.ref("subscriptions.service").as("subscription_service"),
    eb.ref("subscriptions.logo").as("subscription_logo"),
    eb.ref("user_subscriptions.is_favorite").as("subscription_is_favorite"),
    sql<number>`COALESCE(${eb.ref("users_videos_progression.progression")}, 0)`.as(
      "video_viewing_progression",
    ),
    eb
      .exists(
        eb
          .selectFrom("hidden_users_videos")
          .whereRef("hidden_users_videos.video_id", "=", "videos.id")
          .where("hidden_users_videos.user_id", "=", user_id),
      )
      .$castTo<boolean>()
      .as("video_is_hidden"),
  ];
}

export function select_subscriptions_with_user_state(user_id: string) {
  return useDatabase()
    .selectFrom("subscriptions")
    .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
    .select([
      "subscriptions.id",
      "subscriptions.name",
      "subscriptions.slug",
      "subscriptions.service",
      "subscriptions.url",
      "subscriptions.logo",
      "user_subscriptions.is_favorite",
      "user_subscriptions.is_hidden",
    ])
    .select((eb) =>
      eb
        .selectFrom("videos")
        .whereRef("videos.service", "=", "subscriptions.service")
        .whereRef("videos.subscription_id", "=", "subscriptions.service_id")
        .select((eb) => eb.fn.max("videos.created_at").as("created_at"))
        .as("last_video_at"),
    )
    .where("user_subscriptions.user_id", "=", user_id);
}
