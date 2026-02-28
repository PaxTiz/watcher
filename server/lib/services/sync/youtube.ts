import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { VideoTable } from "#server/database/schema";
import type { Sync, SyncSubscriptionsUpsert, SyncVideosUpsert } from "#shared/types/sync";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { chunk } from "es-toolkit";
import { parse, toSeconds } from "iso8601-duration";

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads", "youtube");

export default class SyncYoutube extends AbstractService {
  async sync() {
    const token = await services.credentials.get("google");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const subscriptions = await this.sync_subscriptions(token);
    await this.sync_videos(token, subscriptions);
  }

  private async sync_subscriptions(token: ServiceCredentials) {
    const database = useDatabase();

    const existing_subscriptions = await database
      .selectFrom("subscriptions")
      .select(["service_id"])
      .where("service", "=", "youtube")
      .execute();

    const subscriptions = await this.get_subscriptions(token.access_token);

    const sync: SyncSubscriptionsUpsert = {
      upsert: subscriptions,
      removed: [],
    };

    for (const existing of existing_subscriptions) {
      const exists = subscriptions.find((e) => e.service_id === existing.service_id);
      if (!exists) {
        sync.removed.push(existing.service_id);
      }
    }

    await database.transaction().execute(async (tx) => {
      if (sync.removed.length > 0) {
        await tx
          .deleteFrom("subscriptions")
          .where("service", "=", "youtube")
          .where("service_id", "in", sync.removed)
          .execute();
      }

      await tx
        .insertInto("subscriptions")
        .values(sync.upsert)
        .onConflict((row) =>
          row.columns(["service", "service_id"]).doUpdateSet({
            logo: (c) => c.ref("excluded.logo"),
            url: (c) => c.ref("excluded.url"),
            name: (c) => c.ref("excluded.name"),
          }),
        )
        .execute();
    });

    await this.sync_subscriptions_images(sync);

    return sync;
  }

  private async sync_subscriptions_images(subscriptions: SyncSubscriptionsUpsert) {
    this.createImageDirectory("channels");

    const promises = [];

    for (const subscription of subscriptions.removed) {
      promises.push(rmdir(join(UPLOADS_DIRECTORY, "channels", subscription)));
    }

    for (const subscription of subscriptions.upsert) {
      const callback = async (subscription: Sync["Subscription"]) => {
        this.createImageDirectory("channels", subscription.service_id);

        const image = await fetch(subscription.logo).then((res) => res.arrayBuffer());
        await writeFile(
          join(UPLOADS_DIRECTORY, "channels", subscription.service_id, `logo.jpg`),
          Buffer.from(image),
        );

        this.createImageDirectory("channels", subscription.service_id, "videos");
      };

      promises.push(callback(subscription));
    }

    const chunks = chunk(promises, 100);
    for (const chk of chunks) {
      await Promise.all(chk);
    }
  }

  private async get_subscriptions(token: string) {
    const subscriptions: Sync["SubscriptionsList"] = [];

    let response = await services.external.google.youtubeSubscriptions.list(token);
    while (true) {
      for (const subscription of response.items ?? []) {
        subscriptions.push({
          service: "youtube",
          service_id: subscription.snippet.resourceId.channelId,
          name: subscription.snippet.title,
          url: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
          logo: subscription.snippet.thumbnails.default.url,
          local_logo: `/uploads/youtube/channels/${subscription.snippet.resourceId.channelId}/logo.png`,
        });
      }

      if (response.nextPageToken) {
        response = await services.external.google.youtubeSubscriptions.list(
          token,
          response.nextPageToken,
        );
      } else {
        break;
      }
    }

    return subscriptions;
  }

  private async sync_videos(token: ServiceCredentials, subscriptions: SyncSubscriptionsUpsert) {
    const database = useDatabase();

    const allVideos: Sync["VideosList"] = [];
    for (const subscription of subscriptions.upsert) {
      const videos = await this.get_videos_by_channel_id(
        token.access_token,
        subscription.service_id,
      );

      for (const video of videos) {
        allVideos.push(video);
      }
    }

    const sync: SyncVideosUpsert = {
      upsert: allVideos,
      removed: [],
    };

    await database.transaction().execute(async (tx) => {
      if (subscriptions.removed.length > 0) {
        sync.removed = await tx
          .selectFrom("videos")
          .select("service_id")
          .where("videos.subscription_id", "in", subscriptions.removed)
          .execute()
          .then((res) => res.map((e) => e.service_id));

        await tx
          .deleteFrom("videos")
          .where("service", "=", "youtube")
          .where("service_id", "in", sync.removed)
          .execute();
      }

      await tx
        .insertInto("videos")
        .values(allVideos)
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
    });

    // TODO: Crash when sync video images
    // Connect Timeout Error (attempted addresses: 2a00:1450:4007:809::2016:443, 172.217.22.150:443, 2a00:1450:4007:81b::2016:443, 172.217.22.214:443, 2a00:1450:4007:811::2016:443, 172.217.22.86:443, 2a00:1450:4007:810::2016:443, 142.251.142.22:443, 172.217.22.118:443, 172.217.22.182:443, 172.217.20.54:443, 142.251.39.118:443, 142.251.209.150:443, 142.251.39.214:443, timeout: 10000ms)
    // await this.sync_videos_images(sync);
  }

  private async sync_videos_images(videos: SyncVideosUpsert) {
    const promises = [];

    // TODO: Remove deleted videos thumbnails
    // for (const video of videos.removed) {
    //   promises.push(unlink(join(UPLOADS_DIRECTORY, "channels", video, "videos", `${video}.jpg`)));
    // }

    for (const video of videos.upsert) {
      const callback = async (video: Sync["Video"]) => {
        const image = await fetch(video.thumbnail).then((res) => res.arrayBuffer());
        await writeFile(
          join(
            UPLOADS_DIRECTORY,
            "channels",
            video.subscription_id,
            "videos",
            `${video.service_id}.jpg`,
          ),
          Buffer.from(image),
        );
      };

      promises.push(callback(video));
    }

    const chunks = chunk(promises, 100);
    for (const chk of chunks) {
      await Promise.all(chk);
    }
  }

  private async get_videos_by_channel_id(token: string, channel_id: string) {
    const videos: Array<Omit<VideoTable, "id">> = [];

    const all_videos = await services.external.google.youtubeVideos.get_latest_videos(
      token,
      channel_id,
    );

    for (const video of all_videos) {
      videos.push({
        service: "youtube",
        service_id: video.id,
        subscription_id: channel_id,
        title: video.snippet.title,
        description: video.snippet.description,
        created_at: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.snippet.thumbnails.medium.url,
        duration: toSeconds(parse(video.contentDetails.duration)),
      });
    }

    return videos;
  }

  private createImageDirectory(...path: Array<string>) {
    const _path = join(UPLOADS_DIRECTORY, ...path);

    if (!existsSync(_path)) {
      mkdirSync(_path, { recursive: true });
    }
  }
}
