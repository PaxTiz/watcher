import { sql } from "kysely";

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
  FindSourceInput,
  FindSourceOutput,
  HideForUserInput,
  HideForUserOutput,
  RemoveByServiceIdInput,
  RemoveByServiceIdOutput,
  UpdatePaletteInput,
  UpdatePaletteOutput,
  UpsertInput,
  UpsertOutput,
  UpsertProgressionInput,
  UpsertProgressionOutput,
} from "../../types/videos";
import { resolveDatabase, useDatabase } from "../database";

// Videos visible to the user (followed subscriptions, minus hidden videos) matching `filters`.
// Shared by the count and the page query of `find_all_for_user` so both always agree.
function select_visible_for_user(user_id: string, filters: FindAllForUserFilters) {
  return useDatabase()
    .selectFrom("videos")
    .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
    .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom("hidden_users_videos")
            .where("hidden_users_videos.video_id", "=", eb.ref("videos.id"))
            .where("hidden_users_videos.user_id", "=", eb.ref("user_subscriptions.user_id")),
        ),
      ),
    )
    .$if(!filters.subscription_id, (qb) => qb.where("user_subscriptions.is_hidden", "=", false))
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
          eb(
            "videos.title",
            "@@",
            sql<string>`(websearch_to_tsquery('french', ${filters.query!}))`,
          ),
          eb("videos.title", "ilike", `%${filters.query!}%`),
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
    );
}

export async function find_all_for_user({
  user_id,
  filters,
  pagination,
}: FindAllForUserInput): Promise<FindAllForUserOutput> {
  const total = await select_visible_for_user(user_id, filters)
    .select(({ fn }) => [fn.count<number>("videos.id").as("total")])
    .executeTakeFirst();

  const items = await select_visible_for_user(user_id, filters)
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
    .limit(pagination.per_page)
    .$if(filters.in_progress === true, (qb) =>
      qb.orderBy("users_videos_progression.updated_at", "desc"),
    )
    .orderBy("videos.created_at", "desc")
    .orderBy("videos.id", "desc")
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
      "subscriptions.name as subscription_name",
      "subscriptions.slug as subscription_slug",
      "subscriptions.service as subscription_service",
      "subscriptions.url as subscription_url",
      "subscriptions.logo as subscription_logo",
      "subscriptions.last_synced_at as subscription_last_synced_at",
      "user_subscriptions.is_favorite as subscription_is_favorite",
      sql<number>`COALESCE(${eb.ref("users_videos_progression.progression")}, 0)`.as(
        "video_viewing_progression",
      ),
    ])
    .execute();

  return { total: Number(total?.total ?? 0), items };
}

export async function find_by_id_for_user({
  id,
  user_id,
}: FindByIdForUserInput): Promise<FindByIdForUserOutput> {
  return useDatabase()
    .selectFrom("videos")
    .where("videos.id", "=", id)
    .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
    .leftJoin("user_subscriptions", (qb) =>
      qb
        .onRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
        .on("user_subscriptions.user_id", "=", user_id),
    )
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
      "subscriptions.name as subscription_name",
      "subscriptions.slug as subscription_slug",
      "subscriptions.service as subscription_service",
      "subscriptions.url as subscription_url",
      "subscriptions.logo as subscription_logo",
      "subscriptions.last_synced_at as subscription_last_synced_at",
      sql<boolean>`COALESCE(${eb.ref("user_subscriptions.is_hidden")}, false)`.as(
        "subscription_is_hidden",
      ),
      sql<boolean>`COALESCE(${eb.ref("user_subscriptions.is_favorite")}, false)`.as(
        "subscription_is_favorite",
      ),
      sql<number>`COALESCE(${eb.ref("users_videos_progression.progression")}, 0)`.as(
        "video_viewing_progression",
      ),
    ])
    .executeTakeFirst();
}

export async function find_source({ id }: FindSourceInput): Promise<FindSourceOutput> {
  return useDatabase()
    .selectFrom("videos")
    .select(["service", "service_id", "url"])
    .where("id", "=", id)
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

export async function upsert({ data, options }: UpsertInput): Promise<UpsertOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("videos")
    .values({ ...data, palette: data.palette ? JSON.stringify(data.palette) : null })
    .onConflict((row) =>
      row.columns(["service", "service_id"]).doUpdateSet({
        title: (c) => c.ref("excluded.title"),
        description: (c) => c.ref("excluded.description"),
        url: (c) => c.ref("excluded.url"),
        duration: (c) => c.ref("excluded.duration"),
        thumbnail_small: (c) => c.ref("excluded.thumbnail_small"),
        thumbnail_large: (c) => c.ref("excluded.thumbnail_large"),
        palette: (c) => c.ref("excluded.palette"),
        last_synced_at: (c) => c.ref("excluded.last_synced_at"),
      }),
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
      oc.columns(["user_id", "video_id"]).doUpdateSet({ progression, updated_at: sql`now()` }),
    )
    .execute();
}
