import { ExpressionBuilder, SelectQueryBuilder, sql } from "kysely";

import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import { Database } from "#server/database/schema";
import type { VideoResource } from "#shared/resources/videos";
import type { Paginated } from "#shared/types/shared";
import { VideosValidators } from "#shared/validators/videos";

export default class VideosService extends AbstractService {
  async get_by_id(id: number): Promise<VideoResource> {
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
        isFavorite: false,
        channel: {
          service: video.subscription_service,
          url: video.subscription_url,
          logo: video.subscription_logo,
        },
      },
    };
  }

  async get_url(id: number) {
    const database = useDatabase();
    const video = await database
      .selectFrom("videos")
      .select(["service", "service_id", "url"])
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    if (video.service === "twitch") {
      return {
        service: "twitch",
        url: await services.external.twitch.videos.get_master_playlist(video.service_id),
      };
    } else if (video.service === "youtube") {
      return {
        service: "youtube",
        url: video.url,
      };
    }

    throw new Error(`Could not get URL for video fo service type : ${video.service}`);
  }

  async find_all(params: VideosValidators["list"]["query"]): Promise<Paginated<VideoResource>> {
    const database = useDatabase();

    const total = await database
      .selectFrom("videos")
      .select(({ fn }) => [fn.count<number>("id").as("total")])
      .$if(!!params.service, (qb) => qb.where("videos.service", "=", params.service!))
      .$if(!!params.duration, (qb) => this.parse_duration_filter(qb, params.duration!))
      .executeTakeFirst();

    const items = await database
      .selectFrom("videos")
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .offset((params.page - 1) * 21)
      .limit(21)
      .orderBy("created_at", "desc")
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
        "subscriptions.service as subscription_service",
        "subscriptions.url as subscription_url",
        "subscriptions.logo as subscription_logo",
      ])
      .$if(!!params.service, (qb) => qb.where("videos.service", "=", params.service!))
      .$if(!!params.duration, (qb) => this.parse_duration_filter(qb, params.duration!))
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
          isFavorite: false,
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
      return sql`1 = 1`;
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
}
