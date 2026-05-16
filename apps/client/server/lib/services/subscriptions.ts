import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { SubscriptionResource } from "#shared/resources/subscriptions";

export default class SubscriptionsService extends AbstractService {
  async find_all(user: User): Promise<Array<SubscriptionResource>> {
    const database = useDatabase();

    const subscriptions = await database
      .selectFrom("subscriptions")
      .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
      .where("user_subscriptions.user_id", "=", user.id)
      .select([
        "subscriptions.id",
        "subscriptions.name",
        "subscriptions.service",
        "subscriptions.url",
        "subscriptions.logo",
        "user_subscriptions.is_favorite",
      ])
      .orderBy("name", "asc")
      .execute();

    return subscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      isFavorite: sub.is_favorite,
      channel: {
        service: sub.service,
        url: sub.url,
        logo: sub.logo,
      },
    }));
  }

  async sync(user: User) {
    const sync = [];
    if (user.integrations.google) {
      sync.push(services.sync.youtube.sync(user));
    }
    if (user.integrations.twitch) {
      sync.push(services.sync.twitch.sync(user));
    }

    await Promise.all(sync);
  }
}
