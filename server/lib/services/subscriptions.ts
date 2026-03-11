import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { SubscriptionResource } from "#shared/resources/subscriptions";

export default class SubscriptionsService extends AbstractService {
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
    await services.sync.youtube.sync();
    await services.sync.twitch.sync();
  }
}
