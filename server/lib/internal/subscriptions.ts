import { useDatabase } from "#server/database";
import type { SubscriptionTable, VideoTable } from "#server/database/schema";
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import { ServiceCredentials } from "~~/shared/types/credentials";
import { internal } from ".";
import { external } from "../external";

type SubscriptionsList = Array<Omit<SubscriptionTable, "id">>;
type Subscriptions = {
  added: SubscriptionsList;
  updated: SubscriptionsList;
  removed: SubscriptionsList;
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

    const subscriptions = await this.get_twitch_subscriptions(token, clientId);

    await database.transaction().execute(async (tx) => {
      await tx.insertInto("subscriptions").values(subscriptions.added).execute();

      // TODO: Subscriptions removed
      // TODO: Subscriptions updated
    });

    return subscriptions;
  }

  private async sync_twitch_videos(
    token: ServiceCredentials,
    clientId: string,
    subscriptions: Subscriptions,
  ) {
    const database = useDatabase();

    const allVideos = [];
    for (const subscription of subscriptions.added) {
      const videos = await this.get_twitch_videos_by_steamer(
        token,
        clientId,
        subscription.service_id,
      );

      for (const video of videos) {
        allVideos.push(video);
      }
    }

    await database.insertInto("videos").values(allVideos).execute();
  }

  private async get_twitch_subscriptions(token: ServiceCredentials, clientId: string) {
    const subscriptions: Subscriptions = {
      added: [],
      updated: [],
      removed: [],
    };

    let response = await external.twitch.followers.list({
      userId: token.userId,
      token: token.access_token,
      clientId,
    });
    while (true) {
      for (const subscription of response.data) {
        subscriptions.added.push({
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
