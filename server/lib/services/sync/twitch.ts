import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { VideoTable } from "#server/database/schema";
import type { Sync, SyncSubscriptionsUpsert } from "#shared/types/sync";

export default class SyncTwitch extends AbstractService {
  async sync() {
    const config = useRuntimeConfig();
    const token = await services.credentials.get("twitch");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const subscriptions = await this.sync_subscriptions(token, config.twitch.clientId);
    await this.sync_videos(token, config.twitch.clientId, subscriptions);
  }

  private async sync_subscriptions(token: ServiceCredentials, clientId: string) {
    const database = useDatabase();

    const existing_subscriptions = await database
      .selectFrom("subscriptions")
      .select(["service_id"])
      .where("service", "=", "twitch")
      .execute();

    const subscriptions = await this.get_subscriptions(token, clientId);

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
          .where("service", "=", "twitch")
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

  private async get_subscriptions(token: ServiceCredentials, clientId: string) {
    const subscriptions: Sync["SubscriptionsList"] = [];

    let response = await services.external.twitch.followers.list({
      userId: token.userId,
      token: token.access_token,
      clientId,
    });
    while (true) {
      for (const subscription of response.data) {
        subscriptions.push({
          service: "twitch",
          service_id: subscription.broadcaster_id,
          name: subscription.broadcaster_name,
          url: `https://www.twitch.tv/${subscription.broadcaster_login}`,
          logo: subscription.logo,
        });
      }

      if (response.pagination.cursor) {
        response = await services.external.twitch.followers.list({
          userId: token.userId,
          token: token.access_token,
          cursor: response.pagination.cursor,
          clientId,
        });
      } else {
        break;
      }
    }

    return subscriptions;
  }

  private async sync_videos(
    token: ServiceCredentials,
    clientId: string,
    subscriptions: SyncSubscriptionsUpsert,
  ) {
    const database = useDatabase();

    const allVideos: Sync["VideosList"] = [];
    for (const subscription of subscriptions.upsert) {
      const videos = await this.get_videos_by_channel_id(token, clientId, subscription.service_id);

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

  private async get_videos_by_channel_id(
    token: ServiceCredentials,
    clientId: string,
    steamerId: string,
  ) {
    const videos: Array<Omit<VideoTable, "id">> = [];

    let response = await services.external.twitch.videos.list({
      userId: steamerId,
      token: token.access_token,
      clientId,
    });
    while (true) {
      for (const video of response.data) {
        videos.push({
          service: "twitch",
          service_id: video.id,
          subscription_id: steamerId,
          title: video.title,
          description: video.description,
          created_at: video.created_at,
          url: video.url,
          thumbnail: video.thumbnail_url,
          duration: 0, // TODO: Parse duration
        });
      }

      if (response.pagination.cursor) {
        response = await services.external.twitch.videos.list({
          userId: token.userId,
          token: token.access_token,
          cursor: response.pagination.cursor,
          clientId,
        });
      } else {
        break;
      }
    }

    return videos;
  }
}
