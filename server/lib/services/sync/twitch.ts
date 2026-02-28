import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { Sync } from "#shared/types/sync";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile, rm, unlink } from "node:fs/promises";
import { join } from "node:path";
import { formatISO, differenceInHours } from "date-fns";
import { ServiceCredentials } from "~~/shared/types/credentials";

type TwitchCredentials = ServiceCredentials & {
  client_id: string;
};

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads", "twitch");

export default class SyncTwitch extends AbstractService {
  async sync() {
    const config = useRuntimeConfig();
    const token = await services.credentials.get("twitch");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const credentials: TwitchCredentials = {
      ...token,
      client_id: config.twitch.clientId,
    };

    const subscriptions = await this.get_subscriptions(credentials);
    for (const subscription of subscriptions) {
      await this.sync_subscription(credentials, subscription);
    }
  }

  private async get_subscriptions(credentials: TwitchCredentials) {
    const database = useDatabase();
    const subscriptions: Sync["SubscriptionsList"] = await database
      .selectFrom("subscriptions")
      .selectAll()
      .where("service", "=", "twitch")
      .execute()
      .then((subs) =>
        subs.map((sub) => ({
          status: "deleted",
          channel: {
            service: sub.service,
            service_id: sub.service_id,
            name: sub.name,
            url: sub.url,
            logo: sub.logo,
            last_synced_at: sub.last_synced_at,
          },
        })),
      );

    let response = await services.external.twitch.followers.list({
      userId: credentials.userId,
      token: credentials.access_token,
      clientId: credentials.client_id,
    });

    while (true) {
      for (const subscription of response.data) {
        const existingSub = subscriptions.find(
          (e) => e.channel.service_id === subscription.broadcaster_id,
        );

        if (existingSub) {
          existingSub.status = "updated";
          existingSub.channel = {
            service: "twitch",
            service_id: subscription.broadcaster_id,
            name: subscription.broadcaster_name,
            url: `https://www.twitch.tv/${subscription.broadcaster_login}`,
            logo: subscription.logo,
            last_synced_at: formatISO(new Date()),
          };
        } else {
          subscriptions.push({
            status: "created",
            channel: {
              service: "twitch",
              service_id: subscription.broadcaster_id,
              name: subscription.broadcaster_name,
              url: `https://www.twitch.tv/${subscription.broadcaster_login}`,
              logo: subscription.logo,
              last_synced_at: formatISO(new Date()),
            },
          });
        }
      }

      if (response.pagination.cursor) {
        response = await services.external.twitch.followers.list({
          userId: credentials.userId,
          token: credentials.access_token,
          clientId: credentials.client_id,
          cursor: response.pagination.cursor,
        });
      } else {
        break;
      }
    }

    return subscriptions;
  }

  private async sync_subscription(
    credentials: TwitchCredentials,
    subscription: Sync["Subscription"],
  ) {
    const database = useDatabase();

    if (subscription.status === "deleted") {
      return await this.delete_subscription(subscription);
    }

    subscription.channel.logo = await this.sync_subscription_logo(subscription);

    await database
      .insertInto("subscriptions")
      .values(subscription.channel)
      .onConflict((row) =>
        row.columns(["service", "service_id"]).doUpdateSet({
          logo: (c) => c.ref("excluded.logo"),
          url: (c) => c.ref("excluded.url"),
          name: (c) => c.ref("excluded.name"),
          last_synced_at: (c) => c.ref("excluded.last_synced_at"),
        }),
      )
      .execute();

    const videos = await this.get_videos_by_channel_id(
      credentials,
      subscription.channel.service_id,
    );

    for (const video of videos) {
      await this.sync_video(video);
    }
  }

  private async get_videos_by_channel_id(credentials: TwitchCredentials, channel_id: string) {
    const database = useDatabase();
    const videos: Sync["VideosList"] = await database
      .selectFrom("videos")
      .selectAll()
      .where("service", "=", "twitch")
      .where("subscription_id", "=", channel_id)
      .execute()
      .then((videos) =>
        videos.map((vid) => ({
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
            thumbnail: vid.thumbnail,
            last_synced_at: vid.last_synced_at,
          },
        })),
      );

    let response = await services.external.twitch.videos.list({
      userId: channel_id,
      token: credentials.access_token,
      clientId: credentials.client_id,
    });
    while (true) {
      for (const video of response.data) {
        const existingVid = videos.find((e) => e.video.service_id === video.id);

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
            thumbnail: video.thumbnail_url,
            duration: this.parseDurationToSeconds(video.duration),
            last_synced_at: formatISO(new Date()),
          };
        } else {
          videos.push({
            status: "created",
            video: {
              service: "twitch",
              service_id: video.id,
              subscription_id: channel_id,
              title: video.title,
              description: video.description,
              created_at: video.created_at,
              url: video.url,
              thumbnail: video.thumbnail_url,
              duration: this.parseDurationToSeconds(video.duration),
              last_synced_at: formatISO(new Date()),
            },
          });
        }
      }

      if (response.pagination.cursor) {
        response = await services.external.twitch.videos.list({
          userId: channel_id,
          token: credentials.access_token,
          clientId: credentials.client_id,
          cursor: response.pagination.cursor,
        });
      } else {
        break;
      }
    }

    return videos;
  }

  private async sync_video(video: Sync["Video"]) {
    const database = useDatabase();

    if (video.status === "deleted") {
      return await this.delete_video(video);
    }

    video.video.thumbnail = await this.sync_video_thumbnail(video);

    await database
      .insertInto("videos")
      .values(video.video)
      .onConflict((row) =>
        row.columns(["service", "service_id"]).doUpdateSet({
          title: (c) => c.ref("excluded.title"),
          description: (c) => c.ref("excluded.description"),
          url: (c) => c.ref("excluded.url"),
          duration: (c) => c.ref("excluded.duration"),
          thumbnail: (c) => c.ref("excluded.thumbnail"),
          last_synced_at: (c) => c.ref("excluded.last_synced_at"),
        }),
      )
      .execute();
  }

  private async delete_subscription(subscription: Sync["Subscription"]) {
    const database = useDatabase();

    await database
      .deleteFrom("subscriptions")
      .where("service", "=", "twitch")
      .where("service_id", "=", subscription.channel.service_id)
      .execute();

    await database
      .deleteFrom("videos")
      .where("service", "=", "twitch")
      .where("subscription_id", "=", subscription.channel.service_id)
      .execute();

    try {
      await rm(join(UPLOADS_DIRECTORY, "channels", subscription.channel.service_id), {
        force: true,
        recursive: true,
      });
    } catch {
      // Don't throw an error if could not delete subscription directory
    }
  }

  private async sync_subscription_logo(subscription: Sync["Subscription"]) {
    if (
      subscription.status === "updated" &&
      differenceInHours(new Date(), subscription.channel.last_synced_at) < 24
    ) {
      return subscription.channel.logo;
    }

    this.createImageDirectory("channels", subscription.channel.service_id);

    const image = await fetch(subscription.channel.logo).then((res) => res.arrayBuffer());
    await writeFile(
      join(UPLOADS_DIRECTORY, "channels", subscription.channel.service_id, `logo.jpg`),
      Buffer.from(image),
    );

    this.createImageDirectory("channels", subscription.channel.service_id, "videos");

    return `/twitch/channels/${subscription.channel.service_id}/logo.jpg`;
  }

  private async delete_video(video: Sync["Video"]) {
    const database = useDatabase();

    await database
      .deleteFrom("videos")
      .where("service", "=", "twitch")
      .where("service_id", "=", video.video.service_id)
      .execute();

    try {
      await unlink(
        join(
          UPLOADS_DIRECTORY,
          "channels",
          video.video.subscription_id,
          "videos",
          `${video.video.service_id}.jpg`,
        ),
      );
    } catch {
      // Don't throw an error is count not delete video file
    }
  }

  private async sync_video_thumbnail(video: Sync["Video"]) {
    if (
      video.status === "updated" &&
      differenceInHours(new Date(), video.video.last_synced_at) < 3
    ) {
      return video.video.thumbnail;
    }

    const url = video.video.thumbnail.replace("%{width}", "320").replace("%{height}", "180");
    const image = await fetch(url).then((res) => res.arrayBuffer());

    await writeFile(
      join(
        UPLOADS_DIRECTORY,
        "channels",
        video.video.subscription_id,
        "videos",
        `${video.video.service_id}.jpg`,
      ),
      Buffer.from(image),
    );

    return `/twitch/channels/${video.video.subscription_id}/videos/${video.video.service_id}.jpg`;
  }

  private createImageDirectory(...path: Array<string>) {
    const _path = join(UPLOADS_DIRECTORY, ...path);

    if (!existsSync(_path)) {
      mkdirSync(_path, { recursive: true });
    }
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
}
