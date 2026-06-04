import { formatISO, startOfDay, startOfWeek, sub } from "date-fns";
import { sql, type SelectQueryBuilder } from "kysely";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { useDatabase } from "#server/database";
import type { Database } from "#server/database/schema";
import { useTwitch } from "#server/lib/twitch";
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";
import type { SubscriptionType } from "#shared/types/subscriptions";
import type { VideosValidators } from "#shared/validators/videos";

export default class VideosService extends AbstractService {
  async get_by_id(user: User, id: string): Promise<VideoResource> {
    const database = useDatabase();

    const video = await database
      .selectFrom("videos")
      .where("videos.id", "=", id)
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .leftJoin("user_subscriptions", (qb) =>
        qb
          .onRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
          .on("user_subscriptions.user_id", "=", user.id),
      )
      .leftJoin("users_videos_progression", "users_videos_progression.video_id", "videos.id")
      .select((qb) => [
        "videos.id as video_id",
        "videos.service as video_service",
        "videos.title as video_title",
        "videos.description as video_description",
        "videos.duration as video_duration",
        "videos.url as video_url",
        "videos.thumbnail as video_thumbnail",
        "videos.created_at as video_created_at",
        "subscriptions.id as subscription_id",
        "subscriptions.name as subscription_name",
        "subscriptions.slug as subscription_slug",
        "subscriptions.service as subscription_service",
        "subscriptions.url as subscription_url",
        "subscriptions.logo as subscription_logo",
        "subscriptions.last_synced_at as subscription_last_sync_at",
        sql<boolean>`COALESCE(${qb.ref("user_subscriptions.is_hidden")}, false)`.as(
          "subscription_is_hidden",
        ),
        sql<boolean>`COALESCE(${qb.ref("user_subscriptions.is_favorite")}, false)`.as(
          "subscription_is_favorite",
        ),
        sql<number>`COALESCE(${qb.ref("users_videos_progression.progression")}, 0)`.as(
          "viewing_progression",
        ),
      ])
      .executeTakeFirstOrThrow();

    return {
      id: video.video_id,
      service: video.video_service,
      title: video.video_title,
      description: video.video_description,
      duration: video.video_duration,
      viewing_progression: video.viewing_progression,
      url: video.video_url,
      thumbnail: video.video_thumbnail,
      created_at: video.video_created_at,
      author: {
        id: video.subscription_id,
        name: video.subscription_name,
        slug: video.subscription_slug,
        is_favorite: video.subscription_is_favorite,
        is_hidden: video.subscription_is_hidden,
        last_synced_at: video.subscription_last_sync_at,
        channel: {
          service: video.subscription_service,
          url: video.subscription_url,
          logo: video.subscription_logo,
        },
      },
    };
  }

  async get_url(id: string): Promise<{ service: SubscriptionType; url: string | null }> {
    const database = useDatabase();
    const twitch = useTwitch();
    const config = useRuntimeConfig();

    const video = await database
      .selectFrom("videos")
      .select(["service", "service_id", "url"])
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    if (video.service === "twitch") {
      return {
        service: "twitch",
        url: await twitch.videos.get_master_playlist(
          video.service_id,
          config.oauth.twitch.playerClientId,
        ),
      };
    }

    return {
      service: "youtube",
      url: video.url,
    };
  }

  async find_all(
    user: User,
    params: VideosValidators["list"]["query"],
  ): Promise<Paginated<VideoResource>> {
    const database = useDatabase();

    const total = await database
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
      .where("user_subscriptions.is_hidden", "=", false)
      .where("user_subscriptions.user_id", "=", user.id)
      .select(({ fn }) => [fn.count<number>("videos.id").as("total")])
      .$if(!!params.service, (qb) => qb.where("videos.service", "=", params.service!))
      .$if(params.is_favorite === true, (qb) =>
        qb.where("user_subscriptions.is_favorite", "=", params.is_favorite!),
      )
      .$if(!!params.duration, (qb) => this.parse_duration_filter(qb, params.duration!))
      .$if(!!params.date, (qb) => this.parse_date_filter(qb, params.date!))
      .$if(!!params.subscription_id, (qb) =>
        qb.where("subscriptions.id", "=", params.subscription_id!),
      )
      .$if(!!params.query, (qb) =>
        qb.where("videos.title", "@@", sql<string>`(to_tsquery(${params.query!}))`),
      )
      .executeTakeFirst();

    const items = await database
      .selectFrom("videos")
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
      .leftJoin("users_videos_progression", "users_videos_progression.video_id", "videos.id")
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
      .where("user_subscriptions.is_hidden", "=", false)
      .where("user_subscriptions.user_id", "=", user.id)
      .offset((params.page - 1) * params.per_page)
      .limit(params.per_page)
      .orderBy("videos.created_at", "desc")
      .select((qb) => [
        "videos.id as video_id",
        "videos.service as video_service",
        "videos.title as video_title",
        "videos.description as video_description",
        "videos.duration as video_duration",
        "videos.url as video_url",
        "videos.thumbnail as video_thumbnail",
        "videos.created_at as video_created_at",
        "subscriptions.id as subscription_id",
        "subscriptions.name as subscription_name",
        "subscriptions.slug as subscription_slug",
        "subscriptions.service as subscription_service",
        "subscriptions.url as subscription_url",
        "subscriptions.logo as subscription_logo",
        "subscriptions.last_synced_at as subscription_last_synced_at",
        "user_subscriptions.is_favorite as subscription_is_favorite",
        sql<number>`COALESCE(${qb.ref("users_videos_progression.progression")}, 0)`.as(
          "video_viewing_progression",
        ),
      ])
      .$if(!!params.service, (qb) => qb.where("videos.service", "=", params.service!))
      .$if(params.is_favorite === true, (qb) =>
        qb.where("user_subscriptions.is_favorite", "=", params.is_favorite!),
      )
      .$if(!!params.duration, (qb) => this.parse_duration_filter(qb, params.duration!))
      .$if(!!params.date, (qb) => this.parse_date_filter(qb, params.date!))
      .$if(!!params.subscription_id, (qb) =>
        qb.where("subscriptions.id", "=", params.subscription_id!),
      )
      .$if(!!params.query, (qb) =>
        qb.where("videos.title", "@@", sql<string>`(to_tsquery(${params.query!}))`),
      )
      .execute();

    const mapped_items: Array<VideoResource> = [];
    for (const item of items) {
      mapped_items.push({
        id: item.video_id,
        service: item.video_service,
        title: item.video_title,
        description: item.video_description,
        duration: item.video_duration,
        viewing_progression: item.video_viewing_progression,
        url: item.video_url,
        thumbnail: item.video_thumbnail,
        created_at: item.video_created_at,
        author: {
          id: item.subscription_id,
          name: item.subscription_name,
          slug: item.subscription_slug,
          is_favorite: item.subscription_is_favorite,
          last_synced_at: item.subscription_last_synced_at,
          is_hidden: false,
          channel: {
            service: item.subscription_service,
            url: item.subscription_url,
            logo: item.subscription_logo,
          },
        },
      });
    }

    return {
      total: Number(total?.total ?? 0),
      items: mapped_items,
    };
  }

  async hide(user: User, id: string) {
    const database = useDatabase();

    await database
      .insertInto("hidden_users_videos")
      .values({
        user_id: user.id,
        video_id: id,
      })
      .onConflict((eb) => eb.doNothing())
      .execute();
  }

  async update_progress(user: User, id: string, progression: number) {
    const database = useDatabase();

    const mapped_progression = progression > 0.9 ? 1 : progression;

    await database
      .insertInto("users_videos_progression")
      .values({
        user_id: user.id,
        video_id: id,
        progression: mapped_progression,
      })
      .onConflict((eb) =>
        eb.columns(["user_id", "video_id"]).doUpdateSet({ progression: mapped_progression }),
      )
      .execute();
  }

  private parse_duration_filter(
    qb: SelectQueryBuilder<Database, "videos", any>,
    value: VideosValidators["list"]["query"]["duration"],
  ) {
    if (!value) {
      return qb;
    }

    switch (value) {
      case "less_than_10_minutes":
        return qb.where("videos.duration", "<=", 60 * 10);
      case "between_10_30_minutes":
        return qb.where((q) =>
          q.and([q("videos.duration", ">", 60 * 10), q("videos.duration", "<=", 60 * 30)]),
        );
      case "between_30_60_minutes":
        return qb.where((q) =>
          q.and([q("videos.duration", ">", 60 * 30), q("videos.duration", "<=", 60 * 60)]),
        );
      case "greater_than_1_hour":
        return qb.where("videos.duration", ">=", 60 * 60);
    }
  }

  private parse_date_filter(
    qb: SelectQueryBuilder<Database, "videos", any>,
    value: VideosValidators["list"]["query"]["date"],
  ) {
    if (!value) {
      return qb;
    }

    const date = {
      today: () => formatISO(startOfDay(new Date())),
      weekly: () => formatISO(startOfWeek(new Date())),
      monthly: () => formatISO(sub(new Date(), { days: 30 })),
      yearly: () => formatISO(sub(new Date(), { days: 365 })),
      older: () => formatISO(sub(new Date(), { days: 365 })),
    }[value];

    if (value === "older") {
      return qb.where("videos.created_at", "<=", date());
    }

    return qb.where("videos.created_at", ">=", date());
  }
}
