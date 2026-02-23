import { useDatabase } from "#server/database";
import type { SubscriptionTable, VideoTable } from "#server/database/schema";
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import { ServiceCredentials } from "~~/shared/types/credentials";
import { internal } from ".";
import { external } from "../external";

type Subscription = Omit<SubscriptionTable, "id">;
type SubscriptionsList = Array<Subscription>;
type Subscriptions = {
  added: SubscriptionsList;
  updated: SubscriptionsList;
  removed: SubscriptionsList;
};

type Video = Omit<VideoTable, "id">;
type VideosList = Array<Video>;

type Sync<T> = {
  upsert: T;
  removed: Array<string>;
};

export default class SubscriptionsService {
  async find_all(): Promise<Array<SubscriptionResource>> {
    const database = useDatabase();

    const subscriptions = await database
      .selectFrom("subscriptions")
      .selectAll()
      .orderBy("name", "asc")
      .execute();

    return subscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      isFavorite: false,
      channel: {
        service: sub.service,
        url: sub.url,
        logo: sub.logo,
      },
    }));
  }

  async sync() {
    // TODO: Store logos in local to avoid rate limit
    // TOOD: Update subscription if it exists
    // TODO: Remove subscriptions that does not exists anymore

    await this.sync_youtube();
    await this.sync_twitch();
  }

  private async sync_youtube() {
    const database = useDatabase();
    const token = await internal.credentials.get("google");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const subscriptions: Subscriptions = {
      added: [],
      updated: [],
      removed: [],
    };

    let response = await external.google.youtube.subscriptions.list(token.access_token);
    while (true) {
      for (const subscription of response.data.items ?? []) {
        subscriptions.added.push({
          service: "youtube",
          service_id: subscription.id!,
          name: subscription.snippet!.title!,
          url: `https://www.youtube.com/channel/${subscription.snippet!.resourceId!.channelId}`,
          logo: subscription.snippet!.thumbnails!.default!.url!,
        });
      }

      if (response.data.nextPageToken) {
        response = await external.google.youtube.subscriptions.list(
          token.access_token,
          response.data.nextPageToken ?? undefined,
        );
      } else {
        break;
      }
    }

    await database.transaction().execute(async (tx) => {
      await tx.insertInto("subscriptions").values(subscriptions.added).execute();

      // TODO: Subscriptions removed
      // TODO: Subscriptions updated
    });
  }

  private async sync_twitch() {
    const config = useRuntimeConfig();
    const token = await internal.credentials.get("twitch");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const subscriptions = await this.sync_twitch_subscriptions(token, config.twitch.clientId);
    await this.sync_twitch_videos(token, config.twitch.clientId, subscriptions);
  }

  private async sync_twitch_subscriptions(token: ServiceCredentials, clientId: string) {
    const database = useDatabase();

    const existing_subscriptions = await database
      .selectFrom("subscriptions")
      .select(["service_id"])
      .where("service", "=", token.service === "google" ? "youtube" : "twitch")
      .execute();

    const subscriptions = await this.get_twitch_subscriptions(token, clientId);

    const sync: Sync<SubscriptionsList> = {
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

  private async sync_twitch_videos(
    token: ServiceCredentials,
    clientId: string,
    subscriptions: Sync<SubscriptionsList>,
  ) {
    const database = useDatabase();

    const allVideos: VideosList = [];
    for (const subscription of subscriptions.upsert) {
      const videos = await this.get_twitch_videos_by_steamer(
        token,
        clientId,
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

  private async get_twitch_subscriptions(token: ServiceCredentials, clientId: string) {
    const subscriptions: SubscriptionsList = [];

    let response = await external.twitch.followers.list({
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
        response = await external.twitch.followers.list({
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

  private async get_twitch_videos_by_steamer(
    token: ServiceCredentials,
    clientId: string,
    steamerId: string,
  ) {
    const videos: Array<Omit<VideoTable, "id">> = [];

    let response = await external.twitch.videos.list({
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
        response = await external.twitch.videos.list({
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
