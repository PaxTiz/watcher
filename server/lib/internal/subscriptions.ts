import { useDatabase } from "#server/database";
import type { SubscriptionTable } from "#server/database/schema";
import { internal } from ".";
import { external } from "../external";

export default class SubscriptionsService {
  async sync() {
    await this.sync_youtube();
  }

  private async sync_youtube() {
    const database = useDatabase();
    const token = await internal.credentials.get("google");
    if (!token) {
      throw createError({ statusCode: 403 });
    }

    const subscriptions: Array<Omit<SubscriptionTable, "id">> = [];

    let response = await external.google.youtube.subscriptions.list(token.access_token);
    while (true) {
      for (const subscription of response.data.items ?? []) {
        subscriptions.push({
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

    await database.insertInto("subscriptions").values(subscriptions).execute();
  }
}
