import type { Paginated } from "#shared/types/shared";
import type { VideoResource } from "#shared/resources/videos";
import { useDatabase } from "#server/database";
import { external } from "../external";

export default class VideosService {
  async get_by_id(id: number): Promise<VideoResource> {
    const database = useDatabase();

    const video = await database
      .selectFrom("videos")
      .where("id", "=", id)
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .select([
        "videos.id as video_id",
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
      .select(["service", "service_id"])
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    if (video.service !== "twitch") {
      return null;
    }

    return external.twitch.videos.get_graphql_video_url(video.service_id);
  }

  async find_all(params: { page: number }): Promise<Paginated<VideoResource>> {
    const database = useDatabase();

    const total = await database
      .selectFrom("videos")
      .select(({ fn }) => [fn.count<number>("id").as("total")])
      .executeTakeFirst();

    const items = await database
      .selectFrom("videos")
      .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
      .offset((params.page - 1) * 21)
      .limit(21)
      .orderBy("created_at", "desc")
      .select([
        "videos.id as video_id",
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
      .execute();

    const mapped_items: Array<VideoResource> = [];
    for (const item of items) {
      mapped_items.push({
        id: item.video_id,
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
      total: total?.total ?? 0,
      items: mapped_items,
    };
  }
}
