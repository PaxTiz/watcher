import { subscriptions, userSubscriptions, videos, withTransaction } from "@watcher/database";
import { formatISO } from "date-fns";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useTwitch } from "#server/lib/twitch";
import { IMAGE_SIZES } from "#server/utils/images";
import { count_by_status } from "#server/utils/sync";
import {
  sync_subscription_logo,
  sync_video_thumbnail_and_palette,
} from "#server/utils/sync_images";
import type { Sync } from "#shared/types/sync";
import { async_pool } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

const logger = () => useLogger("services.sync.twitch");

export default class SyncTwitch extends AbstractService {
  async sync(user: User) {
    this.assert_twitch(user);

    const token = await services.credentials.get(user.id, "twitch");
    if (!token) {
      logger().warn("No Twitch credentials: the Twitch sync is skipped");
      return;
    }

    const started_at = Date.now();
    logger().info("Twitch sync started");

    const subscriptions = await this.get_subscriptions(user, token.service_id);
    logger().info(
      {
        total: subscriptions.length,
        ...count_by_status(subscriptions),
      },
      "Twitch subscriptions fetched",
    );

    let failed = 0;
    await async_pool(subscriptions, 10, (sub) =>
      this.sync_subscription(user, sub).catch((error: unknown) => {
        failed++;
        logger().error(
          { err: error, channel_id: sub.channel.service_id, channel: sub.channel.name },
          "Failed to sync a Twitch subscription",
        );
      }),
    );

    logger().info(
      { total: subscriptions.length, failed, duration_ms: Date.now() - started_at },
      "Twitch sync finished",
    );
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
    let pages = 1;

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
        pages++;
        logger().debug({ page: pages }, "Fetching the next page of Twitch follows");

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

      logger().info(
        { channel_id: subscription.channel.service_id, channel: subscription.channel.name },
        "Twitch subscription detached (no longer followed)",
      );

      return;
    }

    const started_at = Date.now();
    logger().debug(
      {
        channel_id: subscription.channel.service_id,
        channel: subscription.channel.name,
        status: subscription.status,
      },
      "Syncing Twitch subscription",
    );

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

    const counts = await this.sync_videos(channel_videos, subscription.channel.name);

    logger().debug(
      {
        channel_id: subscription.channel.service_id,
        channel: subscription.channel.name,
        ...counts,
        duration_ms: Date.now() - started_at,
      },
      "Twitch subscription synced",
    );
  }

  private async get_videos_by_channel_id(user: User, channel_id: string) {
    const twitch_id = this.assert_twitch(user);

    const stored = await videos.find_all_by_subscription({
      service: "twitch",
      subscription_id: channel_id,
    });
    const stored_by_id = new Map(stored.map((video) => [video.service_id, video]));

    const response = await useTwitch().videos.list(
      { user_id: channel_id, first: stored.length === 0 ? 100 : 20 },
      { service_id: twitch_id },
    );

    return response.data.map((video): Sync["Video"] => {
      const existing = stored_by_id.get(video.id);

      return {
        status: existing ? "updated" : "created",
        video: {
          service: "twitch",
          service_id: video.id,
          subscription_id: channel_id,
          title: video.title,
          description: video.description,
          created_at: video.created_at,
          url: video.url,
          thumbnail_small: this.thumbnail_url(video.thumbnail_url, "small"),
          thumbnail_small_local: existing?.thumbnail_small ?? "",
          thumbnail_small_etag: existing?.thumbnail_small_etag ?? "",
          thumbnail_large: existing?.thumbnail_large ?? "",
          thumbnail_large_source: this.thumbnail_url(video.thumbnail_url, "large"),
          duration: this.parseDurationToSeconds(video.duration),
          last_synced_at: formatISO(new Date()),
          palette: existing?.palette ?? null,
        },
      };
    });
  }

  private async sync_videos(channel_videos: Array<Sync["Video"]>, channel_name: string) {
    const counts = count_by_status(channel_videos);

    const patched_videos = await Promise.all(
      channel_videos.map((video) => sync_video_thumbnail_and_palette(video)),
    );

    await videos.upsert_many({ data: patched_videos });

    await services.search.index_guests({
      service: "twitch",
      channel_name,
      videos: patched_videos.map((video) => ({ service_id: video.service_id, title: video.title })),
    });

    return counts;
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
