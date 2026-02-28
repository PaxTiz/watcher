import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { VideoTable } from "#server/database/schema";
import type { Sync, SyncSubscriptionsUpsert } from "#shared/types/sync";

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

    return sync;
  }

  private async get_subscriptions(token: string) {
    const subscriptions: Sync["SubscriptionsList"] = [];

    let response = await services.external.google.youtubeSubscriptions.list(token);
    while (true) {
      for (const subscription of response.data.items ?? []) {
        subscriptions.push({
          service: "youtube",
          service_id: subscription.snippet!.resourceId!.channelId!,
          name: subscription.snippet!.title!,
          url: `https://www.youtube.com/channel/${subscription.snippet!.resourceId!.channelId}`,
          logo: subscription.snippet!.thumbnails!.default!.url!,
        });
      }

      if (response.data.nextPageToken) {
        response = await services.external.google.youtubeSubscriptions.list(
          token,
          response.data.nextPageToken,
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

    await database.transaction().execute(async (tx) => {
      if (subscriptions.removed.length > 0) {
        await tx
          .deleteFrom("videos")
          .innerJoin("subscriptions", "subscriptions.service_id", "videos.subscription_id")
          .where("videos.subscription_id", "in", subscriptions.removed)
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
        service_id: video.id!,
        subscription_id: channel_id,
        title: video.snippet!.title!,
        description: video.snippet!.description!,
        created_at: video.snippet!.publishedAt!,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.snippet!.thumbnails!.medium!.url!,
        duration: 0, // TODO: Parse duration
      });
    }

    return videos;
  }
}
