import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { SubscriptionResource } from "#shared/resources/subscriptions";
import { is_uuid, parse_slug_params } from "#shared/utils/random";

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
        "subscriptions.slug",
        "subscriptions.service",
        "subscriptions.url",
        "subscriptions.logo",
        "subscriptions.last_synced_at",
        "user_subscriptions.is_favorite",
        "user_subscriptions.is_hidden",
      ])
      .orderBy("user_subscriptions.is_hidden", "asc")
      .orderBy("name", "asc")
      .execute();

    return subscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      is_favorite: sub.is_favorite,
      is_hidden: sub.is_hidden,
      last_synced_at: sub.last_synced_at,
      channel: {
        service: sub.service,
        url: sub.url,
        logo: sub.logo,
      },
    }));
  }

  async find_one(user: User, id_or_slug: string): Promise<SubscriptionResource> {
    const database = useDatabase();

    const is_params_uuid = is_uuid(id_or_slug);
    const sub = await database
      .selectFrom("subscriptions")
      .innerJoin("user_subscriptions", "user_subscriptions.subscription_id", "subscriptions.id")
      .select([
        "subscriptions.id",
        "subscriptions.name",
        "subscriptions.slug",
        "subscriptions.service",
        "subscriptions.url",
        "subscriptions.logo",
        "subscriptions.last_synced_at",
        "user_subscriptions.is_favorite",
        "user_subscriptions.is_hidden",
      ])
      .where("user_subscriptions.user_id", "=", user.id)
      .$if(is_params_uuid, (qb) => qb.where("id", "=", id_or_slug))
      .$if(!is_params_uuid, (qb) => qb.where("slug", "=", parse_slug_params(id_or_slug)))
      .executeTakeFirstOrThrow();

    return {
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      is_favorite: sub.is_favorite,
      is_hidden: sub.is_hidden,
      last_synced_at: sub.last_synced_at,
      channel: {
        service: sub.service,
        url: sub.url,
        logo: sub.logo,
      },
    };
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

  async toggle_favorite(user: User, id_or_slug: string) {
    const database = useDatabase();

    const is_params_uuid = is_uuid(id_or_slug);
    await database
      .updateTable("user_subscriptions")
      .from("subscriptions")
      .set({ is_favorite: (c) => c.not(c.ref("is_favorite")) })
      .whereRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
      .where("user_id", "=", user.id)
      .$if(is_params_uuid, (qb) => qb.where("subscriptions.id", "=", id_or_slug))
      .$if(!is_params_uuid, (qb) =>
        qb.where("subscriptions.slug", "=", parse_slug_params(id_or_slug)),
      )
      .execute();
  }

  async hide(user: User, id_or_slug: string) {
    const database = useDatabase();

    const is_params_uuid = is_uuid(id_or_slug);
    await database
      .updateTable("user_subscriptions")
      .from("subscriptions")
      .set({ is_favorite: false, is_hidden: true })
      .whereRef("user_subscriptions.subscription_id", "=", "subscriptions.id")
      .where("user_id", "=", user.id)
      .$if(is_params_uuid, (qb) => qb.where("subscriptions.id", "=", id_or_slug))
      .$if(!is_params_uuid, (qb) =>
        qb.where("subscriptions.slug", "=", parse_slug_params(id_or_slug)),
      )
      .execute();
  }
}
