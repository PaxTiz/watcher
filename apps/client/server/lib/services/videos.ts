import type { Paginated, SubscriptionType, VideoResource } from "@watcher/common";
import { findOrFail, repositoryTypes, videos } from "@watcher/database";
import { formatISO, startOfDay, startOfWeek, sub } from "date-fns";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { useTwitch } from "#server/lib/twitch";
import type { VideosValidators } from "#shared/validators/videos";

type VideoRow = repositoryTypes.videos.VideoRow;
type VideosFilters = repositoryTypes.videos.FindAllForUserFilters;

export default class VideosService extends AbstractService {
  async get_by_id(user: User, id: string): Promise<VideoResource> {
    const video = await findOrFail(videos.find_by_id_for_user({ id, user_id: user.id }), {
      message: "video_not_found",
    });

    return this.to_resource(video, video.subscription_is_hidden);
  }

  async get_url(id: string): Promise<{ service: SubscriptionType; url: string | null }> {
    const twitch = useTwitch();
    const config = useRuntimeConfig();

    const video = await findOrFail(videos.find_source({ id }), { message: "video_not_found" });

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
    const { total, items } = await videos.find_all_for_user({
      user_id: user.id,
      filters: {
        query: params.query,
        service: params.service,
        subscription_id: params.subscription_id,
        is_favorite: params.is_favorite,
        in_progress: params.in_progress,
        duration: params.duration,
        ...this.parse_date_filter(params.date),
      },
      pagination: {
        page: params.page,
        per_page: params.per_page,
        before: params.before,
      },
    });

    return {
      total,
      items: items.map((item) => this.to_resource(item, false)),
    };
  }

  async hide(user: User, id: string) {
    await videos.hide_for_user({ user_id: user.id, video_id: id });
  }

  async update_progress(user: User, id: string, progression: number) {
    await videos.upsert_progression({
      user_id: user.id,
      video_id: id,
      progression: Math.max(0, progression > 0.9 ? 1 : progression),
    });
  }

  private parse_date_filter(
    value: VideosValidators["list"]["query"]["date"],
  ): Pick<VideosFilters, "created_after" | "created_before"> {
    if (!value) {
      return {};
    }

    const date = {
      today: () => formatISO(startOfDay(new Date())),
      weekly: () => formatISO(startOfWeek(new Date())),
      monthly: () => formatISO(sub(new Date(), { days: 30 })),
      yearly: () => formatISO(sub(new Date(), { days: 365 })),
      older: () => formatISO(sub(new Date(), { days: 365 })),
    }[value];

    if (value === "older") {
      return { created_before: date() };
    }

    return { created_after: date() };
  }

  private to_resource(row: VideoRow, is_hidden: boolean): VideoResource {
    return {
      id: row.video_id,
      service: row.video_service,
      title: row.video_title,
      description: row.video_description,
      duration: row.video_duration,
      viewing_progression: row.video_viewing_progression,
      url: row.video_url,
      thumbnails: {
        small: row.video_thumbnail_small,
        large: row.video_thumbnail_large,
      },
      palette: row.video_palette,
      created_at: row.video_created_at,
      author: {
        id: row.subscription_id,
        name: row.subscription_name,
        slug: row.subscription_slug,
        is_favorite: row.subscription_is_favorite,
        is_hidden,
        last_synced_at: row.subscription_last_synced_at,
        channel: {
          service: row.subscription_service,
          url: row.subscription_url,
          logo: row.subscription_logo,
        },
      },
    };
  }
}
