import { existsSync, mkdirSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

import type { Google } from "@watcher/common";
import { subscriptions, userSubscriptions, videos, withTransaction } from "@watcher/database";
import { formatISO, differenceInHours } from "date-fns";
import { parse, toSeconds } from "iso8601-duration";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
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
            logo:
              differenceInHours(new Date(), existing_subscription.channel.last_synced_at) < 24
                ? existing_subscription.channel.logo
                : subscription.snippet.thumbnails.default.url,
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

    subscription.channel.logo = await this.sync_subscription_logo(subscription);

    await withTransaction(async (tx) => {
      const patched_subscription = await subscriptions.upsert({
        data: subscription.channel,
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

    for (const video of channel_videos) {
      await this.sync_video(video);
    }
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
            thumbnail_large: vid.thumbnail_large,
            last_synced_at: vid.last_synced_at,
          },
        })),
      );

    const current_videos = [];

    let all_videos = await google.youtube.videos.get_latests(
      { channel_id },
      { service_id: google_id },
    );

    while (true) {
      await async_pool_with_delay(all_videos.items, 5, 300, (video) =>
        with_retry(async () => {
          if (await this.is_maybe_a_short(video)) {
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
      const existingVid = channel_videos.find((e) => e.video.service_id === video.id);

      if (existingVid) {
        const isValid = differenceInHours(new Date(), existingVid.video.last_synced_at) < 3;

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
          thumbnail_small: isValid
            ? existingVid.video.thumbnail_small
            : video.snippet.thumbnails.medium.url,
          thumbnail_large: isValid
            ? existingVid.video.thumbnail_large
            : (video.snippet.thumbnails.maxres?.url ?? video.snippet.thumbnails.medium.url),
          last_synced_at: formatISO(new Date()),
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
            thumbnail_large:
              video.snippet.thumbnails.maxres?.url ?? video.snippet.thumbnails.medium.url,
            last_synced_at: formatISO(new Date()),
          },
        });
      }
    }

    return channel_videos;
  }

  private async sync_video(video: Sync["Video"]) {
    if (video.status === "deleted") {
      return await this.delete_video(video);
    }

    const thumbnails = await this.sync_video_thumbnail(video);
    video.video.thumbnail_small = thumbnails.small;
    video.video.thumbnail_large = thumbnails.large;

    const palette = await extract_image_palette(video.video.thumbnail_large);

    await videos.upsert({ data: { ...video.video, palette } });
  }

  private async sync_subscription_logo(subscription: Sync["Subscription"]) {
    if (subscription.channel.logo.startsWith("/")) {
      return subscription.channel.logo;
    }

    this.createImageDirectory("channels", subscription.channel.service_id);

    const image = await fetch(subscription.channel.logo).then((res) => res.arrayBuffer());
    await writeFile(
      join(UPLOADS_DIRECTORY, "channels", subscription.channel.service_id, `logo.jpg`),
      Buffer.from(image),
    );

    this.createImageDirectory("channels", subscription.channel.service_id, "videos");

    return `/youtube/channels/${subscription.channel.service_id}/logo.jpg`;
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
    const paths = {
      small: video.video.thumbnail_small,
      large: video.video.thumbnail_large,
    };

    if (
      video.video.thumbnail_small.startsWith("/") &&
      video.video.thumbnail_large.startsWith("/")
    ) {
      return paths;
    }

    const inner = async (key: "small" | "large", path: string) => {
      const image = await fetch(path).then((res) => res.arrayBuffer());

      await writeFile(
        join(
          UPLOADS_DIRECTORY,
          "channels",
          video.video.subscription_id,
          "videos",
          `${video.video.service_id}_${key}.jpg`,
        ),
        Buffer.from(image),
      );

      paths[key] =
        `/youtube/channels/${video.video.subscription_id}/videos/${video.video.service_id}_${key}.jpg`;
    };

    await Promise.all([
      inner("small", video.video.thumbnail_small),
      inner("large", video.video.thumbnail_large),
    ]);

    return paths;
  }

  private createImageDirectory(...path: Array<string>) {
    const _path = join(UPLOADS_DIRECTORY, ...path);

    if (!existsSync(_path)) {
      mkdirSync(_path, { recursive: true });
    }
  }

  private async is_maybe_a_short(video: Google["Youtube"]["Videos"]["Item"]): Promise<boolean> {
    const url = `https://www.youtube.com/shorts/${video.id}`;

    const response = await fetch(url, {
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
