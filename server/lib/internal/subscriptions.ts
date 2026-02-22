import { useDatabase } from "#server/database";
import type { SubscriptionTable } from "#server/database/schema";
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import { internal } from ".";
import { external } from "../external";

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
      channel: {
        service: sub.service,
        url: sub.url,
        logo: sub.logo,
      },
    }));
  }

  async sync() {
    // TODO: Download logos and cache them locally
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
