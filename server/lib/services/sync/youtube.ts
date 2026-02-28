import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { Sync } from "#shared/types/sync";
import type { ServiceCredentials } from "#shared/types/credentials";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile, rmdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { parse, toSeconds } from "iso8601-duration";

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads", "youtube");

export default class SyncYoutube extends AbstractService {
  async sync() {
    const token = await services.credentials.get("google");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const subscriptions = await this.get_subscriptions(token);
    for (const subscription of subscriptions) {
      await this.sync_subscription(token, subscription);
    }
  }

  private async get_subscriptions(credentials: ServiceCredentials) {
    const database = useDatabase();
    const subscriptions: Sync["SubscriptionsList"] = await database
      .selectFrom("subscriptions")
      .selectAll()
      .where("service", "=", "youtube")
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
          },
        })),
      );

    let response = await services.external.google.youtubeSubscriptions.list(
      credentials.access_token,
    );
    while (true) {
      for (const subscription of response.items ?? []) {
        const existingSub = subscriptions.find(
          (e) => e.channel.service === subscription.snippet.resourceId.channelId,
        );

        if (existingSub) {
          existingSub.status = "updated";
        } else {
          subscriptions.push({
            status: "created",
            channel: {
              service: "youtube",
              service_id: subscription.snippet.resourceId.channelId,
              name: subscription.snippet.title,
              url: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
              logo: subscription.snippet.thumbnails.default.url,
            },
          });
        }
      }

      if (response.nextPageToken) {
        response = await services.external.google.youtubeSubscriptions.list(
          credentials.access_token,
          response.nextPageToken,
        );
      } else {
        break;
      }
    }

    return subscriptions;
  }

  private async sync_subscription(
    credentials: ServiceCredentials,
    subscription: Sync["Subscription"],
  ) {
    const database = useDatabase();

    if (subscription.status === "deleted") {
      return await this.delete_subscription(subscription);
    }

    if (subscription.status === "created") {
      subscription.channel.logo = await this.sync_subscription_logo(subscription);
    }

    await database
      .insertInto("subscriptions")
      .values(subscription.channel)
      .onConflict((row) =>
        row.columns(["service", "service_id"]).doUpdateSet({
          logo: (c) => c.ref("excluded.logo"),
          url: (c) => c.ref("excluded.url"),
          name: (c) => c.ref("excluded.name"),
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

  private async get_videos_by_channel_id(credentials: ServiceCredentials, channel_id: string) {
    const database = useDatabase();
    const videos: Sync["VideosList"] = await database
      .selectFrom("videos")
      .selectAll()
      .where("service", "=", "youtube")
      .execute()
      .then((subs) =>
        subs.map((sub) => ({
          status: "deleted",
          video: {
            service: sub.service,
            service_id: sub.service_id,
            subscription_id: channel_id,
            title: sub.title,
            description: sub.description,
            created_at: sub.created_at,
            url: sub.url,
            duration: sub.duration,
            thumbnail: sub.thumbnail,
          },
        })),
      );

    const all_videos = await services.external.google.youtubeVideos.get_latest_videos(
      credentials.access_token,
      channel_id,
    );

    for (const video of all_videos) {
      const existingVid = videos.find((e) => e.video.service_id === video.id);

      if (existingVid) {
        existingVid.status = "updated";
      } else {
        videos.push({
          status: "created",
          video: {
            service: "youtube",
            service_id: video.id,
            subscription_id: channel_id,
            title: video.snippet.title,
            description: video.snippet.description,
            created_at: video.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            duration: toSeconds(parse(video.contentDetails.duration)),
            thumbnail: video.snippet.thumbnails.medium.url,
          },
        });
      }
    }

    return videos;
  }

  private async sync_video(video: Sync["Video"]) {
    const database = useDatabase();

    if (video.status === "deleted") {
      return await this.delete_video(video);
    }

    if (video.status === "created") {
      video.video.thumbnail = await this.sync_video_thumbnail(video);
    }

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
        }),
      )
      .execute();
  }

  private async delete_subscription(subscription: Sync["Subscription"]) {
    const database = useDatabase();

    await database
      .deleteFrom("subscriptions")
      .where("service", "=", "youtube")
      .where("service_id", "=", subscription.channel.service_id)
      .execute();

    await database
      .deleteFrom("videos")
      .where("service", "=", "youtube")
      .where("subscription_id", "=", subscription.channel.service_id)
      .execute();

    await rmdir(join(UPLOADS_DIRECTORY, "channels", subscription.channel.service_id));
  }

  private async sync_subscription_logo(subscription: Sync["Subscription"]) {
    this.createImageDirectory("channels", subscription.channel.service_id);

    const image = await fetch(subscription.channel.logo).then((res) => res.arrayBuffer());
    await writeFile(
      join(UPLOADS_DIRECTORY, "channels", subscription.channel.service_id, `logo.jpg`),
      Buffer.from(image),
    );

    this.createImageDirectory("channels", subscription.channel.service_id, "videos");

    return `/uploads/youtube/channels/${subscription.channel.service_id}/logo.jpg`;
  }

  private async delete_video(video: Sync["Video"]) {
    const database = useDatabase();

    await database
      .deleteFrom("videos")
      .where("service", "=", "youtube")
      .where("service_id", "=", video.video.service_id)
      .execute();

    await unlink(
      join(
        UPLOADS_DIRECTORY,
        "channels",
        video.video.subscription_id,
        `${video.video.service_id}.jpg`,
      ),
    );
  }

  private async sync_video_thumbnail(video: Sync["Video"]) {
    const image = await fetch(video.video.thumbnail).then((res) => res.arrayBuffer());

    await writeFile(
      join(
        UPLOADS_DIRECTORY,
        "channels",
        video.video.subscription_id,
        `${video.video.service_id}.jpg`,
      ),
      Buffer.from(image),
    );

    return `/uploads/youtube/channels/${video.video.subscription_id}/${video.video.service_id}.jpg`;
  }

  private createImageDirectory(...path: Array<string>) {
    const _path = join(UPLOADS_DIRECTORY, ...path);

    if (!existsSync(_path)) {
      mkdirSync(_path, { recursive: true });
    }
  }
}
