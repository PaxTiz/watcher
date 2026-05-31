import { formatISO, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import type { SelectQueryBuilder } from "kysely";

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
  async get_by_id(id: string): Promise<VideoResource> {
    const database = useDatabase();

    const video = await database
      .selectFrom("videos")
      .where("videos.id", "=", id)
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .select([
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
      ])
      .executeTakeFirstOrThrow();

    return {
      id: video.video_id,
      service: video.video_service,
      title: video.video_title,
      description: video.video_description,
      duration: video.video_duration,
      url: video.video_url,
      thumbnail: video.video_thumbnail,
      created_at: video.video_created_at,
      author: {
        id: video.subscription_id,
        name: video.subscription_name,
        slug: video.subscription_slug,
        is_favorite: false,
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
      .$if(!!params.query, (qb) => qb.where("videos.title", "ilike", `%${params.query}%`))
      .executeTakeFirst();

    const items = await database
      .selectFrom("videos")
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
      .where("user_subscriptions.user_id", "=", user.id)
      .offset((params.page - 1) * params.per_page)
      .limit(params.per_page)
      .orderBy("videos.created_at", "desc")
      .select([
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
        "user_subscriptions.is_favorite as subscription_is_favorite",
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
      .$if(!!params.query, (qb) => qb.where("videos.title", "ilike", `%${params.query}%`))
      .execute();

    const mapped_items: Array<VideoResource> = [];
    for (const item of items) {
      mapped_items.push({
        id: item.video_id,
        service: item.video_service,
        title: item.video_title,
        description: item.video_description,
        duration: item.video_duration,
        url: item.video_url,
        thumbnail: item.video_thumbnail,
        created_at: item.video_created_at,
        author: {
          id: item.subscription_id,
          name: item.subscription_name,
          slug: item.subscription_slug,
          is_favorite: item.subscription_is_favorite,
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
      monthly: () => formatISO(startOfMonth(new Date())),
      yearly: () => formatISO(startOfYear(new Date())),
      older: () => formatISO(startOfYear(new Date())),
    }[value];

    if (value === "older") {
      return qb.where("videos.created_at", "<=", date());
    }

    return qb.where("videos.created_at", ">=", date());
  }
}
