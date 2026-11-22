import { type ExpressionBuilder, sql } from "kysely";

import type {
  FindAllBySubscriptionInput,
  FindAllBySubscriptionOutput,
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
  FindThumbnailsInput,
  FindThumbnailsOutput,
  HideForUserInput,
  HideForUserOutput,
  FindKnownInput,
  FindKnownOutput,
  InsertNewInput,
  InsertNewOutput,
  FindPublishedSinceInput,
  FindPublishedSinceOutput,
  RemoveManyInput,
  RemoveManyOutput,
  MarkCheckedInput,
  MarkCheckedOutput,
  UpdateMetadataManyInput,
  UpdateMetadataManyOutput,
  ClaimToCheckInput,
  ClaimToCheckOutput,
  CountUncheckedInput,
  CountUncheckedOutput,
  ShowForUserInput,
  ShowForUserOutput,
  UpdateLargeThumbnailInput,
  UpdateLargeThumbnailOutput,
  UpdatePaletteInput,
  UpdatePaletteOutput,
  UpsertProgressionInput,
  UpsertProgressionOutput,
} from "../../types/videos";
import { type DatabaseInterface, resolveDatabase, useDatabase } from "../database";
import {
  select_video_row,
  select_viewing_progression,
  select_visible_videos_for_user,
  video_search_score,
} from "../queries";

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

export async function find_all_for_user({
  user_id,
  filters,
  pagination,
}: FindAllForUserInput): Promise<FindAllForUserOutput> {
  const query = filters.query?.trim() || undefined;
  filters = { ...filters, query };

  const count_query = pagination.with_total
    ? select_visible_videos_for_user(user_id, filters)
        .select(({ fn }) => [fn.count<number>("videos.id").as("total")])
        .executeTakeFirst()
    : undefined;

  const page_query = select_visible_videos_for_user(user_id, filters)
    .leftJoin("users_videos_progression", (qb) =>
      qb
        .onRef("users_videos_progression.video_id", "=", "videos.id")
        .on("users_videos_progression.user_id", "=", user_id),
    )
    .$if(!!pagination.before && !query, (qb) =>
      qb.where(
        sql<boolean>`(videos.created_at, videos.id) < (SELECT created_at, id FROM videos WHERE id = ${pagination.before!})`,
      ),
    )
    .$if(!!pagination.before && !!query, (qb) =>
      qb.where(
        sql<boolean>`(${video_search_score(query!)}, videos.created_at, videos.id) < (SELECT ${video_search_score(query!, "cursor_video")}, cursor_video.created_at, cursor_video.id FROM videos AS cursor_video WHERE cursor_video.id = ${pagination.before!})`,
      ),
    )
    .offset(pagination.before ? 0 : (pagination.page - 1) * pagination.per_page)
    .limit(pagination.per_page + 1) // the extra row tells whether a next page exists
    .$if(filters.in_progress === true, (qb) =>
      qb.orderBy("users_videos_progression.updated_at", "desc"),
    )
    .$if(!!query, (qb) => qb.orderBy(video_search_score(query!), "desc"))
    .orderBy("videos.created_at", "desc")
    .orderBy("videos.id", "desc")
    .select(select_video_row(user_id))
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
    .where("videos.ready_at", "is not", null)
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
      "videos.service_id as video_service_id",
      "videos.checked_at as video_checked_at",
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
      ...select_viewing_progression(eb),
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
      ...select_viewing_progression(eb),
    ])
    .where("videos.id", "!=", id)
    .where("videos.ready_at", "is not", null)
    .where("videos.service", "=", (eb) =>
      eb.selectFrom("videos").select("service").where("id", "=", id),
    )
    .where("videos.subscription_id", "=", (eb) =>
      eb.selectFrom("videos").select("subscription_id").where("id", "=", id),
    )
    .where("videos.created_at", order === "asc" ? ">" : "<", (eb) =>
      eb.selectFrom("videos").select("created_at").where("id", "=", id),
    )
    .where((eb) =>
      eb.or([
        eb("users_videos_progression.position", "is", null),
        eb("users_videos_progression.position", "<", eb.ref("videos.duration")),
      ]),
    )
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
    .select(["videos.service", "videos.service_id", "videos.url", "videos.duration"])
    .where("videos.id", "=", id)
    .$if(viewable_only === true, (qb) => qb.where(where_viewable_by(user_id)))
    .executeTakeFirst();
}

export async function find_thumbnails({ id }: FindThumbnailsInput): Promise<FindThumbnailsOutput> {
  return useDatabase()
    .selectFrom("videos")
    .select([
      "service",
      "service_id",
      "subscription_id",
      "thumbnail_small",
      "thumbnail_large",
      "thumbnail_large_source",
    ])
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function find_all_by_subscription({
  service,
  subscription_id,
}: FindAllBySubscriptionInput): Promise<FindAllBySubscriptionOutput> {
  return useDatabase()
    .selectFrom("videos")
    .select([
      "id",
      "service",
      "service_id",
      "subscription_id",
      "title",
      "description",
      "duration",
      "url",
      "thumbnail_small",
      "thumbnail_small_etag",
      "thumbnail_large",
      "thumbnail_large_source",
      "palette",
      "created_at",
      "last_synced_at",
    ])
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
    .select(["id", "thumbnail_small"])
    .where("palette", "is", null)
    .$if(after_id !== null, (qb) => qb.where("id", ">", after_id!))
    .orderBy("id")
    .limit(limit)
    .execute();
}

export async function insert_new({ data, options }: InsertNewInput): Promise<InsertNewOutput> {
  const database = resolveDatabase(options);

  if (data.length === 0) {
    return [];
  }

  return database
    .insertInto("videos")
    .values(
      data.map((video) => ({
        ...video,
        palette: video.palette ? JSON.stringify(video.palette) : null,
      })),
    )
    .onConflict((oc) => oc.columns(["service", "service_id"]).doNothing())
    .returning(["id", "service_id", "subscription_id", "title"])
    .execute();
}

export async function find_known({
  service,
  service_ids,
}: FindKnownInput): Promise<FindKnownOutput> {
  if (service_ids.length === 0) {
    return [];
  }

  const rows = await useDatabase()
    .selectFrom("videos")
    .select("service_id")
    .where("service", "=", service)
    .where("service_id", "in", service_ids)
    .execute();

  return rows.map((row) => row.service_id);
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

export async function update_large_thumbnail({
  id,
  thumbnail_large,
  options,
}: UpdateLargeThumbnailInput): Promise<UpdateLargeThumbnailOutput> {
  const database = resolveDatabase(options);

  await database.updateTable("videos").set({ thumbnail_large }).where("id", "=", id).execute();
}

export async function find_published_since({
  service,
  subscription_id,
  content_type,
  since,
}: FindPublishedSinceInput): Promise<FindPublishedSinceOutput> {
  return useDatabase()
    .selectFrom("videos")
    .select(["id", "service_id", "thumbnail_small", "thumbnail_large"])
    .where("service", "=", service)
    .where("subscription_id", "=", subscription_id)
    .where("content_type", "=", content_type)
    .where("created_at", ">=", since)
    .execute();
}

export async function remove_many({ ids, options }: RemoveManyInput): Promise<RemoveManyOutput> {
  const database = resolveDatabase(options);

  if (ids.length === 0) {
    return;
  }

  await database.deleteFrom("videos").where("id", "in", ids).execute();
}

export async function mark_checked({ ids }: MarkCheckedInput): Promise<MarkCheckedOutput> {
  if (ids.length === 0) {
    return;
  }

  await useDatabase()
    .updateTable("videos")
    .set({ checked_at: sql<string>`now()` })
    .where("id", "in", ids)
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
  position,
  duration,
  options,
}: UpsertProgressionInput): Promise<UpsertProgressionOutput> {
  const database = resolveDatabase(options);

  await database
    .insertInto("users_videos_progression")
    .values({ user_id, video_id, position })
    .onConflict((oc) =>
      oc
        .columns(["user_id", "video_id"])
        .doUpdateSet({ position, updated_at: sql`now()` })
        .where("users_videos_progression.position", "<", duration)
        .where("users_videos_progression.position", "is distinct from", position),
    )
    .execute();
}

export async function update_metadata_many({
  data,
}: UpdateMetadataManyInput): Promise<UpdateMetadataManyOutput> {
  if (data.length === 0) {
    return;
  }

  await sql`
    UPDATE videos v
    SET title = d.title, description = d.description, duration = d.duration, last_synced_at = now()
    FROM jsonb_to_recordset(${JSON.stringify(data)}::jsonb) AS d(
      id uuid,
      title varchar,
      description text,
      duration integer
    )
    WHERE v.id = d.id
  `.execute(useDatabase());
}

export async function claim_to_check({
  service,
  created_before,
  checked_before,
  limit,
}: ClaimToCheckInput): Promise<ClaimToCheckOutput> {
  return useDatabase()
    .updateTable("videos")
    .set({ checked_at: sql<string>`now()` })
    .where("id", "in", (eb) =>
      eb
        .selectFrom("videos")
        .select("id")
        .where("service", "=", service)
        .where("created_at", "<", created_before)
        .where((eb) => eb.or([eb("checked_at", "is", null), eb("checked_at", "<", checked_before)]))
        .orderBy(sql`checked_at NULLS FIRST`)
        .limit(limit)
        .forUpdate()
        .skipLocked(),
    )
    .returning(["id", "service_id", "thumbnail_small", "thumbnail_large"])
    .execute();
}

export async function count_unchecked({
  service,
  created_before,
  checked_before,
}: CountUncheckedInput): Promise<CountUncheckedOutput> {
  const row = await useDatabase()
    .selectFrom("videos")
    .select(sql<number>`count(*)::int`.as("count"))
    .where("service", "=", service)
    .where("created_at", "<", created_before)
    .where((eb) => eb.or([eb("checked_at", "is", null), eb("checked_at", "<", checked_before)]))
    .executeTakeFirstOrThrow();

  return row.count;
}
