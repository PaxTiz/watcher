import { type ExpressionBuilder, sql } from "kysely";

import type {
  FindAllBySubscriptionInput,
  FindAllBySubscriptionOutput,
  FindAllForUserFilters,
  FindAllForUserInput,
  FindAllForUserOutput,
  FindAllWithoutPaletteInput,
  FindAllWithoutPaletteOutput,
  FindByIdForUserInput,
  FindByIdForUserOutput,
  FindAdjacentInput,
  FindAdjacentOutput,
  FindSourceInput,
  FindSourceOutput,
  HideForUserInput,
  HideForUserOutput,
  RemoveByServiceIdInput,
  RemoveByServiceIdOutput,
  ShowForUserInput,
  ShowForUserOutput,
  UpdatePaletteInput,
  UpdatePaletteOutput,
  UpsertInput,
  UpsertOutput,
  UpsertProgressionInput,
  UpsertProgressionOutput,
} from "../../types/videos";
import { type DatabaseInterface, resolveDatabase, useDatabase } from "../database";

const escape_like = (value: string) => value.replace(/[\\%_]/g, "\\$&");

function where_viewable_by(user_id: string) {
  return (eb: ExpressionBuilder<DatabaseInterface, "videos" | "user_subscriptions">) =>
    eb.and([
      eb("user_subscriptions.is_hidden", "=", false),
      eb.not(
        eb.exists(
          eb
            .selectFrom("hidden_users_videos")
            .whereRef("hidden_users_videos.video_id", "=", "videos.id")
            .where("hidden_users_videos.user_id", "=", user_id),
        ),
      ),
    ]);
}

// Videos visible to the user (followed and not hidden subscriptions, minus hidden and watched
// videos) matching `filters`.
// Shared by the count and the page query of `find_all_for_user` so both always agree.
function select_visible_for_user(user_id: string, filters: FindAllForUserFilters) {
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
    .$if(!!filters.query, (qb) =>
      qb.where((eb) =>
        eb.or([
          sql<boolean>`videos.title_search @@ websearch_to_tsquery('french', ${filters.query!})`,
          eb("videos.title", "ilike", `%${escape_like(filters.query!)}%`),
        ]),
      ),
    )
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

export async function find_all_for_user({
  user_id,
  filters,
  pagination,
}: FindAllForUserInput): Promise<FindAllForUserOutput> {
  const count_query = pagination.with_total
    ? select_visible_for_user(user_id, filters)
        .select(({ fn }) => [fn.count<number>("videos.id").as("total")])
        .executeTakeFirst()
    : undefined;

  const page_query = select_visible_for_user(user_id, filters)
    .leftJoin("users_videos_progression", (qb) =>
      qb
        .onRef("users_videos_progression.video_id", "=", "videos.id")
        .on("users_videos_progression.user_id", "=", user_id),
    )
    .$if(!!pagination.before, (qb) =>
      qb.where(
        sql<boolean>`(videos.created_at, videos.id) < (SELECT created_at, id FROM videos WHERE id = ${pagination.before!})`,
      ),
    )
    .offset(pagination.before ? 0 : (pagination.page - 1) * pagination.per_page)
    .limit(pagination.per_page + 1) // the extra row tells whether a next page exists
    .$if(filters.in_progress === true, (qb) =>
      qb.orderBy("users_videos_progression.updated_at", "desc"),
    )
    .orderBy("videos.created_at", "desc")
    .orderBy("videos.id", "desc")
    .select((eb) => [
      "videos.id as video_id",
      "videos.service as video_service",
      "videos.title as video_title",
      "videos.duration as video_duration",
      "videos.url as video_url",
      "videos.thumbnail_small as video_thumbnail_small",
      "videos.thumbnail_large as video_thumbnail_large",
      "videos.palette as video_palette",
      "videos.created_at as video_created_at",
      "subscriptions.id as subscription_id",
      "subscriptions.name as subscription_name",
      "subscriptions.slug as subscription_slug",
      "subscriptions.service as subscription_service",
      "subscriptions.logo as subscription_logo",
      "user_subscriptions.is_favorite as subscription_is_favorite",
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
    ])
    .execute();

  const [count, rows] = await Promise.all([count_query, page_query]);

  return {
    total: pagination.with_total ? Number(count?.total ?? 0) : undefined,
    items: rows.slice(0, pagination.per_page),
    has_more: rows.length > pagination.per_page,
  };
}

export async function find_by_id_for_user({
  id,
  user_id,
}: FindByIdForUserInput): Promise<FindByIdForUserOutput> {
  return useDatabase()
    .selectFrom("videos")
    .where("videos.id", "=", id)
    .innerJoin("subscriptions", (qb) =>
      qb
        .onRef("subscriptions.service_id", "=", "videos.subscription_id")
        .onRef("subscriptions.service", "=", "videos.service"),
    )
    .innerJoin("user_subscriptions", (qb) =>
      qb
        .onRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
        .on("user_subscriptions.user_id", "=", user_id),
    )
    .where(where_viewable_by(user_id))
    .leftJoin("users_videos_progression", (qb) =>
      qb
        .onRef("users_videos_progression.video_id", "=", "videos.id")
        .on("users_videos_progression.user_id", "=", user_id),
    )
    .select((eb) => [
      "videos.id as video_id",
      "videos.service as video_service",
      "videos.title as video_title",
      "videos.description as video_description",
      "videos.duration as video_duration",
      "videos.url as video_url",
      "videos.thumbnail_small as video_thumbnail_small",
      "videos.thumbnail_large as video_thumbnail_large",
      "videos.palette as video_palette",
      "videos.created_at as video_created_at",
      "subscriptions.id as subscription_id",
      "subscriptions.service_id as subscription_service_id",
      "subscriptions.name as subscription_name",
      "subscriptions.slug as subscription_slug",
      "subscriptions.service as subscription_service",
      "subscriptions.logo as subscription_logo",
      sql<boolean>`COALESCE(${eb.ref("user_subscriptions.is_favorite")}, false)`.as(
        "subscription_is_favorite",
      ),
      sql<number>`COALESCE(${eb.ref("users_videos_progression.progression")}, 0)`.as(
        "video_viewing_progression",
      ),
    ])
    .executeTakeFirst();
}

export async function find_adjacent({
  id,
  user_id,
  limit,
  order,
}: FindAdjacentInput): Promise<FindAdjacentOutput> {
  return useDatabase()
    .selectFrom("videos")
    .innerJoin("subscriptions", (qb) =>
      qb
        .onRef("subscriptions.service_id", "=", "videos.subscription_id")
        .onRef("subscriptions.service", "=", "videos.service"),
    )
    .leftJoin("users_videos_progression", (qb) =>
      qb
        .onRef("users_videos_progression.video_id", "=", "videos.id")
        .on("users_videos_progression.user_id", "=", user_id),
    )
    .innerJoin("user_subscriptions", (qb) =>
      qb
        .onRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
        .on("user_subscriptions.user_id", "=", user_id),
    )
    .select((eb) => [
      "videos.id as video_id",
      "videos.service as video_service",
      "videos.title as video_title",
      "videos.duration as video_duration",
      "videos.url as video_url",
      "videos.thumbnail_small as video_thumbnail_small",
      "videos.thumbnail_large as video_thumbnail_large",
      "videos.palette as video_palette",
      "videos.created_at as video_created_at",
      "subscriptions.id as subscription_id",
      "subscriptions.name as subscription_name",
      "subscriptions.slug as subscription_slug",
      "subscriptions.service as subscription_service",
      "subscriptions.logo as subscription_logo",
      sql<boolean>`COALESCE(${eb.ref("user_subscriptions.is_favorite")}, false)`.as(
        "subscription_is_favorite",
      ),
      sql<number>`COALESCE(${eb.ref("users_videos_progression.progression")}, 0)`.as(
        "video_viewing_progression",
      ),
    ])
    .where("videos.id", "!=", id)
    .where("videos.service", "=", (eb) =>
      eb.selectFrom("videos").select("service").where("id", "=", id),
    )
    .where("videos.subscription_id", "=", (eb) =>
      eb.selectFrom("videos").select("subscription_id").where("id", "=", id),
    )
    .where("videos.created_at", order === "asc" ? ">" : "<", (eb) =>
      eb.selectFrom("videos").select("created_at").where("id", "=", id),
    )
    .where("users_videos_progression.progression", "is distinct from", 1)
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom("hidden_users_videos")
            .select([eb.lit(1).as("expect_not_exists")])
            .where("hidden_users_videos.user_id", "=", user_id)
            .where("hidden_users_videos.video_id", "=", (ib) => eb.ref("videos.id")),
        ),
      ),
    )
    .orderBy("videos.created_at", order)
    .limit(limit)
    .execute();
}

export async function find_source({
  id,
  user_id,
  viewable_only,
}: FindSourceInput): Promise<FindSourceOutput> {
  return useDatabase()
    .selectFrom("videos")
    .innerJoin("subscriptions", (qb) =>
      qb
        .onRef("subscriptions.service_id", "=", "videos.subscription_id")
        .onRef("subscriptions.service", "=", "videos.service"),
    )
    .innerJoin("user_subscriptions", (qb) =>
      qb
        .onRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
        .on("user_subscriptions.user_id", "=", user_id),
    )
    .select(["videos.service", "videos.service_id", "videos.url"])
    .where("videos.id", "=", id)
    .$if(viewable_only === true, (qb) => qb.where(where_viewable_by(user_id)))
    .executeTakeFirst();
}

export async function find_all_by_subscription({
  service,
  subscription_id,
}: FindAllBySubscriptionInput): Promise<FindAllBySubscriptionOutput> {
  return useDatabase()
    .selectFrom("videos")
    .selectAll()
    .where("service", "=", service)
    .where("subscription_id", "=", subscription_id)
    .execute();
}

export async function find_all_without_palette({
  after_id,
  limit,
}: FindAllWithoutPaletteInput): Promise<FindAllWithoutPaletteOutput> {
  return useDatabase()
    .selectFrom("videos")
    .select(["id", "thumbnail_large"])
    .where("palette", "is", null)
    .$if(after_id !== null, (qb) => qb.where("id", ">", after_id!))
    .orderBy("id")
    .limit(limit)
    .execute();
}

export async function upsert_many({ data, options }: UpsertInput): Promise<UpsertOutput> {
  const database = resolveDatabase(options);

  if (data.length === 0) {
    return;
  }

  await database
    .insertInto("videos")
    .values(
      data.map((video) => ({
        ...video,
        palette: video.palette ? JSON.stringify(video.palette) : null,
      })),
    )
    .onConflict((row) =>
      row
        .columns(["service", "service_id"])
        .doUpdateSet({
          title: (c) => c.ref("excluded.title"),
          description: (c) => c.ref("excluded.description"),
          url: (c) => c.ref("excluded.url"),
          duration: (c) => c.ref("excluded.duration"),
          thumbnail_small: (c) => c.ref("excluded.thumbnail_small"),
          thumbnail_small_etag: (c) => c.ref("excluded.thumbnail_small_etag"),
          thumbnail_large: (c) => c.ref("excluded.thumbnail_large"),
          thumbnail_large_etag: (c) => c.ref("excluded.thumbnail_large_etag"),
          palette: (c) => c.ref("excluded.palette"),
        })
        .where(
          sql<boolean>`(
            videos.title, videos.description, videos.url, videos.duration,
            videos.thumbnail_small, videos.thumbnail_small_etag,
            videos.thumbnail_large, videos.thumbnail_large_etag, videos.palette
          ) IS DISTINCT FROM (
            excluded.title, excluded.description, excluded.url, excluded.duration,
            excluded.thumbnail_small, excluded.thumbnail_small_etag,
            excluded.thumbnail_large, excluded.thumbnail_large_etag, excluded.palette
          )`,
        ),
    )
    .execute();
}

export async function update_palette({
  id,
  palette,
  options,
}: UpdatePaletteInput): Promise<UpdatePaletteOutput> {
  const database = resolveDatabase(options);

  await database
    .updateTable("videos")
    .set({ palette: JSON.stringify(palette) })
    .where("id", "=", id)
    .execute();
}

export async function remove_by_service_id({
  service,
  service_id,
  options,
}: RemoveByServiceIdInput): Promise<RemoveByServiceIdOutput> {
  const database = resolveDatabase(options);

  await database
    .deleteFrom("videos")
    .where("service", "=", service)
    .where("service_id", "=", service_id)
    .execute();
}

export async function hide_for_user({
  user_id,
  video_id,
  options,
}: HideForUserInput): Promise<HideForUserOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("hidden_users_videos")
    .values({ user_id, video_id })
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function show_for_user({
  user_id,
  video_id,
  options,
}: ShowForUserInput): Promise<ShowForUserOutput> {
  const database = resolveDatabase(options);

  await database
    .deleteFrom("hidden_users_videos")
    .where("user_id", "=", user_id)
    .where("video_id", "=", video_id)
    .execute();
}

export async function upsert_progression({
  user_id,
  video_id,
  progression,
  options,
}: UpsertProgressionInput): Promise<UpsertProgressionOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("users_videos_progression")
    .values({ user_id, video_id, progression })
    .onConflict((oc) =>
      oc
        .columns(["user_id", "video_id"])
        .doUpdateSet({ progression, updated_at: sql`now()` })
        .where("users_videos_progression.progression", "is distinct from", progression),
    )
    .execute();
}
