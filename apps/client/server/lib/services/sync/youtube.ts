import { type Google, request_options } from "@watcher/common";
import { subscriptions, userSubscriptions, videos, withTransaction } from "@watcher/database";
import { formatISO } from "date-fns";
import { parse, toSeconds } from "iso8601-duration";
import { ofetch } from "ofetch";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import { count_by_status } from "#server/utils/sync";
import {
  remove_video_thumbnails,
  sync_subscription_logo,
  sync_video_thumbnail_and_palette,
} from "#server/utils/sync_images";
import type { Sync } from "#shared/types/sync";
import { async_pool, create_limiter, with_retry } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

const shorts_limiter = create_limiter(10, 25);

const logger = () => useLogger("services.sync.youtube");

export default class SyncYoutube extends AbstractService {
  async sync(user: User) {
    this.assert_google(user);

    const token = await services.credentials.get(user.id, "google");
    if (!token) {
      logger().warn("No Google credentials: the YouTube sync is skipped");
      return;
    }

    const started_at = Date.now();
    logger().info("YouTube sync started");

    const subscriptions = await this.get_subscriptions(user);
    logger().info(
      {
        total: subscriptions.length,
        ...count_by_status(subscriptions),
      },
      "YouTube subscriptions fetched",
    );

    let failed = 0;
    await async_pool(subscriptions, 10, (sub) =>
      this.sync_subscription(user, sub).catch((error: unknown) => {
        failed++;
        logger().error(
          { err: error, channel_id: sub.channel.service_id, channel: sub.channel.name },
          "Failed to sync a YouTube subscription",
        );
      }),
    );

    logger().info(
      { total: subscriptions.length, failed, duration_ms: Date.now() - started_at },
      "YouTube sync finished",
    );
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
    let pages = 1;
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
        pages++;
        logger().debug({ page: pages }, "Fetching the next page of YouTube subscriptions");

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
      await userSubscriptions.detach({
        user_id: user.id,
        service: subscription.channel.service,
        service_id: subscription.channel.service_id,
      });

      logger().info(
        { channel_id: subscription.channel.service_id, channel: subscription.channel.name },
        "YouTube subscription detached (no longer followed)",
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
      "Syncing YouTube subscription",
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
      "YouTube subscription synced",
    );
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

    const current_videos: Array<Google["Youtube"]["Videos"]["Item"]> = [];

    let all_videos = await google.youtube.videos.get_latests(
      { channel_id },
      { service_id: google_id },
    );

    while (true) {
      const new_videos = all_videos.items.filter((video) => !channel_videos_indexed[video.id]);
      current_videos.push(...all_videos.items.filter((video) => channel_videos_indexed[video.id]));

      const shorts_checks = await Promise.allSettled(
        new_videos.map(async (video) => {
          const is_short = await with_retry(() =>
            shorts_limiter(() => this.is_maybe_a_short(video)),
          );

          if (!is_short) {
            current_videos.push(video);
          }

          return is_short;
        }),
      );

      // A video whose check failed is skipped: the next sync checks it again
      for (const [index, check] of shorts_checks.entries()) {
        if (check.status === "rejected") {
          logger().warn(
            { err: check.reason, channel_id, video_id: new_videos[index]?.id },
            "Failed to check if a YouTube video is a short: skipped",
          );
        }
      }

      logger().trace(
        {
          channel_id,
          fetched: all_videos.items.length,
          new: new_videos.length,
          shorts: shorts_checks.filter((c) => c.status === "fulfilled" && c.value).length,
          kept: current_videos.length,
        },
        "YouTube videos page processed",
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
          thumbnail_small: video.snippet.thumbnails.high.url,
          thumbnail_small_local: existingVid.video.thumbnail_small,
          thumbnail_small_etag: existingVid.video.thumbnail_small_etag,
          thumbnail_large: existingVid.video.thumbnail_large,
          thumbnail_large_source:
            video.snippet.thumbnails.maxres?.url ?? video.snippet.thumbnails.high.url,
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
            thumbnail_small: video.snippet.thumbnails.high.url,
            thumbnail_small_local: "",
            thumbnail_small_etag: "",
            thumbnail_large: "",
            thumbnail_large_source:
              video.snippet.thumbnails.maxres?.url ?? video.snippet.thumbnails.high.url,
            last_synced_at: formatISO(new Date()),
            palette: null,
          },
        });
      }
    }

    return channel_videos;
  }

  private async sync_videos(channel_videos: Array<Sync["Video"]>, channel_name: string) {
    const counts = count_by_status(channel_videos);

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

    await services.search.index_guests({
      service: "youtube",
      channel_name,
      videos: patched_videos.map((video) => ({ service_id: video.service_id, title: video.title })),
    });

    return counts;
  }

  private async delete_video(video: Sync["Video"]) {
    await videos.remove_by_service_id({ service: "youtube", service_id: video.video.service_id });
    await remove_video_thumbnails(video);
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
