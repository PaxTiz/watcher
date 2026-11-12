import { subscriptions, userSubscriptions, videos, withTransaction } from "@watcher/database";
import { formatISO } from "date-fns";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useTwitch } from "#server/lib/twitch";
import { IMAGE_SIZES } from "#server/utils/images";
import {
  remove_video_thumbnails,
  sync_subscription_logo,
  sync_video_thumbnail_and_palette,
} from "#server/utils/sync_images";
import type { Sync } from "#shared/types/sync";
import { async_pool } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

export default class SyncTwitch extends AbstractService {
  async sync(user: User) {
    this.assert_twitch(user);

    const token = await services.credentials.get(user.id, "twitch");
    if (!token) {
      return;
    }

    const subscriptions = await this.get_subscriptions(user, token.service_id);
    await async_pool(subscriptions, 10, (sub) => this.sync_subscription(user, sub));
  }

  private async get_subscriptions(user: User, service_id: string) {
    const twitch_id = this.assert_twitch(user);

    const user_subscriptions: Sync["SubscriptionsList"] = await subscriptions
      .find_all_for_sync({ user_id: user.id, service: "twitch" })
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

    let response = await services.external.twitch.helpers.get_followers(
      {
        user_id: service_id,
      },
      { service_id: twitch_id },
    );

    while (true) {
      for (const subscription of response.data) {
        const existing_subscription = user_subscriptions.find(
          (e) => e.channel.service_id === subscription.broadcaster_id,
        );

        if (existing_subscription) {
          existing_subscription.status = "updated";
          existing_subscription.channel = {
            service: "twitch",
            service_id: subscription.broadcaster_id,
            name: subscription.broadcaster_name,
            slug: to_subscription_slug("twitch", subscription.broadcaster_name),
            url: `https://www.twitch.tv/${subscription.broadcaster_login}`,
            logo: subscription.logo,
            logo_local: existing_subscription.channel.logo,
            logo_etag: existing_subscription.channel.logo_etag,
            last_synced_at: formatISO(new Date()),
          };
        } else {
          user_subscriptions.push({
            status: "created",
            channel: {
              service: "twitch",
              service_id: subscription.broadcaster_id,
              name: subscription.broadcaster_name,
              slug: to_subscription_slug("twitch", subscription.broadcaster_name),
              url: `https://www.twitch.tv/${subscription.broadcaster_login}`,
              logo: subscription.logo,
              logo_local: "",
              logo_etag: "",
              last_synced_at: formatISO(new Date()),
            },
          });
        }
      }

      if (response.pagination.cursor) {
        response = await services.external.twitch.helpers.get_followers(
          {
            user_id: service_id,
            cursor: response.pagination.cursor,
          },
          { service_id: twitch_id },
        );
      } else {
        break;
      }
    }

    return user_subscriptions;
  }

  private async sync_subscription(user: User, subscription: Sync["Subscription"]) {
    if (subscription.status === "deleted") {
      await userSubscriptions.detach({
        user_id: user.id,
        service: subscription.channel.service,
        service_id: subscription.channel.service_id,
      });

      return;
    }

    const logo = await sync_subscription_logo(subscription);
    subscription.channel.logo = logo.path;
    subscription.channel.logo_etag = logo.etag;

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
    const twitch_id = this.assert_twitch(user);

    const twitch = useTwitch();

    const channel_videos: Sync["VideosList"] = await videos
      .find_all_by_subscription({ service: "twitch", subscription_id: channel_id })
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
            thumbnail_large_source: vid.thumbnail_large_source,
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

    let response = await twitch.videos.list({ user_id: channel_id }, { service_id: twitch_id });

    while (true) {
      for (const video of response.data) {
        const existingVid = channel_videos_indexed[video.id];

        if (existingVid) {
          existingVid.status = "updated";
          existingVid.video = {
            service: "twitch",
            service_id: video.id,
            subscription_id: channel_id,
            title: video.title,
            description: video.description,
            created_at: video.created_at,
            url: video.url,
            thumbnail_small: this.thumbnail_url(video.thumbnail_url, "small"),
            thumbnail_small_local: existingVid.video.thumbnail_small,
            thumbnail_small_etag: existingVid.video.thumbnail_small_etag,
            thumbnail_large: existingVid.video.thumbnail_large,
            thumbnail_large_source: this.thumbnail_url(video.thumbnail_url, "large"),
            duration: this.parseDurationToSeconds(video.duration),
            last_synced_at: formatISO(new Date()),
            palette: existingVid.video.palette,
          };
        } else {
          channel_videos.push({
            status: "created",
            video: {
              service: "twitch",
              service_id: video.id,
              subscription_id: channel_id,
              title: video.title,
              description: video.description,
              created_at: video.created_at,
              url: video.url,
              thumbnail_small: this.thumbnail_url(video.thumbnail_url, "small"),
              thumbnail_small_etag: "",
              thumbnail_small_local: "",
              thumbnail_large: "",
              thumbnail_large_source: this.thumbnail_url(video.thumbnail_url, "large"),
              duration: this.parseDurationToSeconds(video.duration),
              last_synced_at: formatISO(new Date()),
              palette: null,
            },
          });
        }
      }

      if (response.pagination.cursor) {
        response = await twitch.videos.list(
          { user_id: channel_id, cursor: response.pagination.cursor },
          { service_id: twitch_id },
        );
      } else {
        break;
      }
    }

    return channel_videos;
  }

  private async sync_videos(channel_videos: Array<Sync["Video"]>) {
    const deleted = channel_videos.filter((video) => video.status === "deleted");
    await Promise.all(deleted.map((video) => this.delete_video(video)));

    const deleted_ids = deleted.map((video) => video.video.service_id);
    const active_videos = channel_videos.filter(
      (video) => !deleted_ids.includes(video.video.service_id),
    );

    const with_thumbnail_and_palette = active_videos.map((video) =>
      sync_video_thumbnail_and_palette(video),
    );
    const patched_videos = await Promise.all(with_thumbnail_and_palette);

    await videos.upsert_many({ data: patched_videos });
  }

  private async delete_video(video: Sync["Video"]) {
    await videos.remove_by_service_id({ service: "twitch", service_id: video.video.service_id });
    await remove_video_thumbnails(video);
  }

  private thumbnail_url(template: string, size: "small" | "large") {
    return template
      .replace("%{width}", IMAGE_SIZES[size].width.toString())
      .replace("%{height}", IMAGE_SIZES[size].height.toString());
  }

  private parseDurationToSeconds(duration: string): number {
    const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
    const match = duration.match(regex);

    if (!match || !match[0]) {
      return 0;
    }

    const hours = parseInt(match[1] ?? "0", 10);
    const minutes = parseInt(match[2] ?? "0", 10);
    const seconds = parseInt(match[3] ?? "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  private assert_twitch(user: User): string {
    if (!user.integrations.twitch) {
      throw new Error("Twitch integration not available for user");
    }

    return user.integrations.twitch!;
  }
}
