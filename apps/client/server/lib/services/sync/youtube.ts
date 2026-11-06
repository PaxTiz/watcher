import { existsSync, mkdirSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

import { type Google, request_options } from "@watcher/common";
import { subscriptions, userSubscriptions, videos, withTransaction } from "@watcher/database";
import { formatISO } from "date-fns";
import { parse, toSeconds } from "iso8601-duration";
import { ofetch } from "ofetch";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import { conditional_headers, INVALID_ETAG, read_image_response } from "#server/utils/images";
import { extract_image_palette } from "#server/utils/palette";
import type { Sync } from "#shared/types/sync";
import { async_pool, async_pool_with_delay, with_retry } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads", "youtube");

export default class SyncYoutube extends AbstractService {
  async sync(user: User) {
    this.assert_google(user);

    const token = await services.credentials.get(user.id, "google");
    if (!token) {
      return;
    }

    const subscriptions = await this.get_subscriptions(user);
    await async_pool(subscriptions, 10, (sub) => this.sync_subscription(user, sub));
  }

  private async get_subscriptions(user: User) {
    const google_id = this.assert_google(user);

    const google = useGoogle();

    const user_subscriptions: Sync["SubscriptionsList"] = await subscriptions
      .find_all_for_sync({ user_id: user.id, service: "youtube" })
      .then((subs) =>
        subs.map((sub) => ({
          status: "deleted",
          channel: {
            service: sub.service,
            service_id: sub.service_id,
            name: sub.name,
            slug: sub.slug,
            url: sub.url,
            logo: sub.logo,
            logo_local: sub.logo,
            logo_etag: sub.logo_etag,
            last_synced_at: sub.last_synced_at,
          },
        })),
      );

    let response = await google.youtube.subscriptions.list({}, { service_id: google_id });
    while (true) {
      for (const subscription of response.items ?? []) {
        const existing_subscription = user_subscriptions.find(
          (e) => e.channel.service_id === subscription.snippet.resourceId.channelId,
        );

        if (existing_subscription) {
          existing_subscription.status = "updated";
          existing_subscription.channel = {
            service: "youtube",
            service_id: subscription.snippet.resourceId.channelId,
            name: subscription.snippet.title,
            slug: to_subscription_slug("youtube", subscription.snippet.title),
            url: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
            logo: subscription.snippet.thumbnails.default.url,
            logo_local: existing_subscription.channel.logo,
            logo_etag: existing_subscription.channel.logo_etag,
            last_synced_at: formatISO(new Date()),
          };
        } else {
          user_subscriptions.push({
            status: "created",
            channel: {
              service: "youtube",
              service_id: subscription.snippet.resourceId.channelId,
              name: subscription.snippet.title,
              slug: to_subscription_slug("youtube", subscription.snippet.title),
              url: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
              logo: subscription.snippet.thumbnails.default.url,
              logo_local: "",
              logo_etag: "",
              last_synced_at: formatISO(new Date()),
            },
          });
        }
      }

      if (response.nextPageToken) {
        response = await google.youtube.subscriptions.list(
          { cursor: response.nextPageToken },
          { service_id: google_id },
        );
      } else {
        break;
      }
    }

    return user_subscriptions;
  }

  private async sync_subscription(user: User, subscription: Sync["Subscription"]) {
    if (subscription.status === "deleted") {
      return;
    }

    const logo = await this.sync_subscription_logo(subscription);
    subscription.channel.logo = logo.logo;
    subscription.channel.logo_etag = logo.etag ?? INVALID_ETAG;

    await withTransaction(async (tx) => {
      const { logo_local, ...subscription_data } = subscription.channel;
      const patched_subscription = await subscriptions.upsert({
        data: subscription_data,
        options: { tx },
      });

      await userSubscriptions.attach({
        user_id: user.id,
        subscription_id: patched_subscription.id,
        options: { tx },
      });
    });

    const channel_videos = await this.get_videos_by_channel_id(
      user,
      subscription.channel.service_id,
    );

    await this.sync_videos(channel_videos);
  }

  private async get_videos_by_channel_id(user: User, channel_id: string) {
    const google_id = this.assert_google(user);

    const google = useGoogle();

    const channel_videos: Sync["VideosList"] = await videos
      .find_all_by_subscription({ service: "youtube", subscription_id: channel_id })
      .then((rows) =>
        rows.map((vid) => ({
          status: "deleted",
          video: {
            service: vid.service,
            service_id: vid.service_id,
            subscription_id: channel_id,
            title: vid.title,
            description: vid.description,
            created_at: vid.created_at,
            url: vid.url,
            duration: vid.duration,
            thumbnail_small: vid.thumbnail_small,
            thumbnail_small_local: vid.thumbnail_small,
            thumbnail_small_etag: vid.thumbnail_small_etag,
            thumbnail_large: vid.thumbnail_large,
            thumbnail_large_local: vid.thumbnail_large,
            thumbnail_large_etag: vid.thumbnail_large_etag,
            last_synced_at: vid.last_synced_at,
            palette: vid.palette,
          },
        })),
      );

    const channel_videos_indexed = channel_videos.reduce(
      (acc, video) => {
        acc[video.video.service_id] = video;
        return acc;
      },
      {} as Record<string, Sync["VideosList"][number]>,
    );

    const current_videos: Array<Google["Youtube"]["Videos"]["Item"]> = [];

    let all_videos = await google.youtube.videos.get_latests(
      { channel_id },
      { service_id: google_id },
    );

    while (true) {
      await async_pool_with_delay(all_videos.items, 5, 300, (video) =>
        with_retry(async () => {
          const is_known = channel_videos_indexed[video.id];
          if (!is_known && (await this.is_maybe_a_short(video))) {
            return;
          }

          current_videos.push(video);
        }),
      );

      if (current_videos.length >= 50) {
        break;
      }

      if (all_videos.nextPageToken) {
        all_videos = await google.youtube.videos.get_latests(
          { channel_id, cursor: all_videos.nextPageToken },
          { service_id: google_id },
        );
      } else {
        break;
      }
    }

    for (const video of current_videos) {
      const existingVid = channel_videos_indexed[video.id];

      if (existingVid) {
        existingVid.status = "updated";
        existingVid.video = {
          service: "youtube",
          service_id: video.id,
          subscription_id: channel_id,
          title: video.snippet.title,
          description: video.snippet.description,
          created_at: video.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          duration: this.parse_duration(video.contentDetails.duration),
          thumbnail_small: video.snippet.thumbnails.medium.url,
          thumbnail_small_local: existingVid.video.thumbnail_small,
          thumbnail_small_etag: existingVid.video.thumbnail_small_etag,
          thumbnail_large:
            video.snippet.thumbnails.maxres?.url ?? video.snippet.thumbnails.medium.url,
          thumbnail_large_local: existingVid.video.thumbnail_large,
          thumbnail_large_etag: existingVid.video.thumbnail_large_etag,
          last_synced_at: formatISO(new Date()),
          palette: existingVid.video.palette,
        };
      } else {
        channel_videos.push({
          status: "created",
          video: {
            service: "youtube",
            service_id: video.id,
            subscription_id: channel_id,
            title: video.snippet.title,
            description: video.snippet.description,
            created_at: video.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            duration: this.parse_duration(video.contentDetails.duration),
            thumbnail_small: video.snippet.thumbnails.medium.url,
            thumbnail_small_local: "",
            thumbnail_small_etag: "",
            thumbnail_large:
              video.snippet.thumbnails.maxres?.url ?? video.snippet.thumbnails.medium.url,
            thumbnail_large_local: "",
            thumbnail_large_etag: "",
            last_synced_at: formatISO(new Date()),
            palette: null,
          },
        });
      }
    }

    return channel_videos;
  }

  private async sync_video_thumbnail_and_palette(video: Sync["Video"]) {
    const thumbnails = await this.sync_video_thumbnail(video);
    video.video.thumbnail_small = thumbnails.small.url;
    video.video.thumbnail_small_etag = thumbnails.small.etag ?? INVALID_ETAG;
    video.video.thumbnail_large = thumbnails.large.url;
    video.video.thumbnail_large_etag = thumbnails.large.etag ?? INVALID_ETAG;

    const palette =
      thumbnails.large_downloaded || !video.video.palette
        ? await extract_image_palette(video.video.thumbnail_large)
        : video.video.palette;

    const { thumbnail_small_local, thumbnail_large_local, ...vid } = video.video;

    return {
      ...vid,
      palette,
    };
  }

  private async sync_videos(channel_videos: Array<Sync["Video"]>) {
    const deleted = channel_videos.filter((video) => video.status === "deleted");
    await Promise.all(deleted.map((video) => this.delete_video(video)));

    const deleted_ids = deleted.map((video) => video.video.service_id);
    const active_videos = channel_videos.filter(
      (video) => !deleted_ids.includes(video.video.service_id),
    );

    const with_thumbnail_and_palette = active_videos.map((video) =>
      this.sync_video_thumbnail_and_palette(video),
    );
    const patched_videos = await Promise.all(with_thumbnail_and_palette);

    await videos.upsert_many({ data: patched_videos });
  }

  private async sync_subscription_logo(subscription: Sync["Subscription"]) {
    const response = await ofetch
      .raw(subscription.channel.logo, {
        ...request_options(),
        responseType: "stream",
        headers: await conditional_headers(
          subscription.channel.logo_etag,
          subscription.channel.logo_local,
        ),
      })
      .catch(() => null);

    if (!response || response.status === 304) {
      return { etag: subscription.channel.logo_etag, logo: subscription.channel.logo_local };
    }

    const image = await read_image_response(response);
    if (!image) {
      return { etag: subscription.channel.logo_etag, logo: subscription.channel.logo_local };
    }

    const etag = response.headers.get("etag");

    this.createImageDirectory("channels", subscription.channel.service_id);

    await writeFile(
      join(UPLOADS_DIRECTORY, "channels", subscription.channel.service_id, `logo.jpg`),
      image,
    );

    this.createImageDirectory("channels", subscription.channel.service_id, "videos");

    return { etag, logo: `/youtube/channels/${subscription.channel.service_id}/logo.jpg` };
  }

  private async delete_video(video: Sync["Video"]) {
    await videos.remove_by_service_id({ service: "youtube", service_id: video.video.service_id });

    try {
      await Promise.allSettled([
        unlink(
          join(
            UPLOADS_DIRECTORY,
            "channels",
            video.video.subscription_id,
            "videos",
            `${video.video.service_id}_small.jpg`,
          ),
        ),
        unlink(
          join(
            UPLOADS_DIRECTORY,
            "channels",
            video.video.subscription_id,
            "videos",
            `${video.video.service_id}_large.jpg`,
          ),
        ),
      ]);
    } catch {
      // Don't throw an error is count not delete video file
    }
  }

  private async sync_video_thumbnail(video: Sync["Video"]) {
    const paths: {
      small: { url: string; etag: string | null };
      large: { url: string; etag: string | null };
    } = {
      small: { url: video.video.thumbnail_small_local, etag: video.video.thumbnail_small_etag },
      large: { url: video.video.thumbnail_large_local, etag: video.video.thumbnail_large_etag },
    };

    const inner = async (key: "small" | "large", path: string) => {
      const response = await ofetch
        .raw(path, {
          ...request_options(),
          responseType: "stream",
          headers: await conditional_headers(
            video.video[`thumbnail_${key}_etag`],
            video.video[`thumbnail_${key}_local`],
          ),
        })
        .catch(() => null);

      if (!response || response.status === 304) {
        return false;
      }

      const image = await read_image_response(response);
      if (!image) {
        return false;
      }

      const etag = response.headers.get("etag");

      await writeFile(
        join(
          UPLOADS_DIRECTORY,
          "channels",
          video.video.subscription_id,
          "videos",
          `${video.video.service_id}_${key}.jpg`,
        ),
        image,
      );

      paths[key] = {
        url: `/youtube/channels/${video.video.subscription_id}/videos/${video.video.service_id}_${key}.jpg`,
        etag,
      };

      return true;
    };

    const [, large_downloaded] = await Promise.all([
      inner("small", video.video.thumbnail_small),
      inner("large", video.video.thumbnail_large),
    ]);

    return { ...paths, large_downloaded };
  }

  private createImageDirectory(...path: Array<string>) {
    const _path = join(UPLOADS_DIRECTORY, ...path);

    if (!existsSync(_path)) {
      mkdirSync(_path, { recursive: true });
    }
  }

  private async is_maybe_a_short(video: Google["Youtube"]["Videos"]["Item"]): Promise<boolean> {
    const url = `https://www.youtube.com/shorts/${video.id}`;

    const response = await ofetch.raw(url, {
      ...request_options({ retry: 0 }),
      method: "HEAD",
      redirect: "manual",
      headers: {
        Cookie: "SOCS=CAI; CONSENT=YES+1",
      },
    });

    if (response.status === 200) {
      return true;
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location") ?? "";
      if (location.includes("/watch")) {
        return false;
      }
    }

    throw new Error(
      `Unexpected status ${response.status} for video ${video.id}, location: ${response.headers.get("location")}`,
    );
  }

  private parse_duration(duration?: string) {
    if (!duration) {
      return 0;
    }

    return toSeconds(parse(duration));
  }

  private assert_google(user: User): string {
    if (!user.integrations.google) {
      throw new Error("Google integration not available for user");
    }

    return user.integrations.google!;
  }
}
