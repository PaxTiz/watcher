import type { Page, SubscriptionType, VideoListResource, VideoResource } from "@watcher/common";
import { findOrFail, repositoryTypes, videos } from "@watcher/database";
import { formatISO, startOfDay, sub } from "date-fns";
import { defineCachedFunction } from "nitropack/runtime";
import { useRuntimeConfig } from "nuxt/server";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { useTwitch } from "#server/lib/twitch";
import { public_image_url, sync_image } from "#server/utils/images";
import { video_thumbnail_path } from "#server/utils/sync_images";
import type { VideosValidators } from "#shared/validators/videos";

type VideoRow = repositoryTypes.videos.VideoRow & { video_is_hidden?: boolean };
type VideosFilters = repositoryTypes.videos.FindAllForUserFilters;

const MASTER_PLAYLIST_CACHE_TTL = 60 * 5; // 5 minutes, in seconds

const logger = () => useLogger("services.videos");

const get_twitch_master_playlist = defineCachedFunction(
  async (video_id: string) => {
    logger().debug({ twitch_video_id: video_id }, "Fetching the Twitch master playlist");

    const playlist = await useTwitch().videos.get_master_playlist(
      video_id,
      useRuntimeConfig().oauth.twitch.playerClientId,
    );

    if (!playlist) {
      logger().warn({ twitch_video_id: video_id }, "No Twitch master playlist for this video");
    }

    return playlist;
  },
  {
    name: "twitch_master_playlist",
    maxAge: MASTER_PLAYLIST_CACHE_TTL,
    swr: false,
    getKey: (video_id: string) => video_id,
    validate: (entry) => !!entry.value,
  },
);

const pending_large_thumbnails = new Map<string, Promise<string>>();

export default class VideosService extends AbstractService {
  async get_by_id(user: User, id: string): Promise<VideoResource> {
    const video = await findOrFail(videos.find_by_id_for_user({ id, user_id: user.id }), {
      message: "video_not_found",
    });

    return {
      ...this.to_list_resource(video),
      description: video.video_description,
    };
  }

  async get_url(
    user: User,
    id: string,
  ): Promise<{ service: SubscriptionType; url: string | null }> {
    const video = await this.find_source_or_fail(user, id, true);

    if (video.service === "twitch") {
      return {
        service: "twitch",
        url: await get_twitch_master_playlist(video.service_id),
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
  ): Promise<Page<VideoListResource> & { total?: number }> {
    const { total, items, has_more } = await videos.find_all_for_user({
      user_id: user.id,
      filters: {
        query: params.query,
        service: params.service,
        subscription_id: params.subscription_id,
        is_favorite: params.is_favorite,
        in_progress: params.in_progress,
        with_hidden: params.with_hidden,
        with_watched: params.with_watched,
        duration: params.duration,
        ...this.parse_date_filter(params.date),
      },
      pagination: {
        page: params.page,
        per_page: params.per_page,
        before: params.before,
        with_total: params.with_total !== false && !params.before,
      },
    });

    return {
      total,
      items: items.map((item) => this.to_list_resource(item)),
      has_more,
    };
  }

  async find_next_recommandetions(user: User, id: string) {
    await this.find_source_or_fail(user, id, true);

    const surrounding = 10;

    const newer = await videos.find_adjacent({
      id,
      user_id: user.id,
      order: "asc",
      limit: surrounding,
    });

    if (newer.length === 10) {
      return newer.map((video) => this.to_list_resource(video));
    }

    const older = await videos.find_adjacent({
      id,
      user_id: user.id,
      order: "desc",
      limit: surrounding - newer.length,
    });

    return [...newer, ...older].map((video) => this.to_list_resource(video));
  }

  async hide(user: User, id: string) {
    await this.find_source_or_fail(user, id);

    await videos.hide_for_user({ user_id: user.id, video_id: id });

    logger().debug({ video_id: id }, "Video hidden");
  }

  async show(user: User, id: string) {
    await this.find_source_or_fail(user, id);

    await videos.show_for_user({ user_id: user.id, video_id: id });

    logger().debug({ video_id: id }, "Video shown");
  }

  async update_progress(user: User, id: string, progression: number) {
    await this.find_source_or_fail(user, id);

    await videos.upsert_progression({
      user_id: user.id,
      video_id: id,
      progression: Math.max(0, progression > 0.9 ? 1 : progression),
    });

    logger().trace({ video_id: id, progression }, "Video progression updated");
  }

  async get_large_thumbnail(user: User, id: string): Promise<string> {
    await this.find_source_or_fail(user, id);

    const video = await findOrFail(videos.find_thumbnails({ id }), {
      message: "video_not_found",
    });

    let path = video.thumbnail_large;
    if (!path) {
      let pending = pending_large_thumbnails.get(id);
      if (!pending) {
        pending = this.generate_large_thumbnail(id, video).finally(() =>
          pending_large_thumbnails.delete(id),
        );
        pending_large_thumbnails.set(id, pending);
      }

      path = await pending;
    }

    return public_image_url(path || video.thumbnail_small);
  }

  private async generate_large_thumbnail(
    id: string,
    video: NonNullable<repositoryTypes.videos.FindThumbnailsOutput>,
  ) {
    const path = video_thumbnail_path(video, "large");
    const started_at = Date.now();

    const large = await sync_image({
      url: video.thumbnail_large_source,
      path,
      size: "large",
      current: { path: "", etag: null },
    });

    if (!large) {
      logger().warn(
        { video_id: id, source: video.thumbnail_large_source },
        "Failed to generate the large thumbnail: the small one is used",
      );
      return "";
    }

    await videos.update_large_thumbnail({ id, thumbnail_large: path });

    logger().debug(
      { video_id: id, path, duration_ms: Date.now() - started_at },
      "Large thumbnail generated",
    );

    return path;
  }

  private find_source_or_fail(user: User, id: string, viewable_only = false) {
    return findOrFail(videos.find_source({ id, user_id: user.id, viewable_only }), {
      message: "video_not_found",
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
      weekly: () => formatISO(sub(new Date(), { days: 7 })),
      monthly: () => formatISO(sub(new Date(), { days: 30 })),
      yearly: () => formatISO(sub(new Date(), { days: 365 })),
      older: () => formatISO(sub(new Date(), { days: 365 })),
    }[value];

    if (value === "older") {
      return { created_before: date() };
    }

    return { created_after: date() };
  }

  private to_list_resource(row: VideoRow): VideoListResource {
    return {
      id: row.video_id,
      service: row.video_service,
      title: row.video_title,
      duration: row.video_duration,
      viewing_progression: row.video_viewing_progression,
      url: row.video_url,
      thumbnails: {
        small: public_image_url(row.video_thumbnail_small),
        large: row.video_thumbnail_large
          ? public_image_url(row.video_thumbnail_large)
          : `/api/videos/${row.video_id}/thumbnails/large`, // generates it, and redirects to it
      },
      palette: row.video_palette,
      created_at: row.video_created_at,
      is_hidden: row.video_is_hidden ?? false,
      author: {
        id: row.subscription_id,
        name: row.subscription_name,
        slug: row.subscription_slug,
        is_favorite: row.subscription_is_favorite,
        is_hidden: false, // videos of hidden subscriptions are never returned
        channel: {
          service: row.subscription_service,
          logo: public_image_url(row.subscription_logo),
        },
      },
    };
  }
}
