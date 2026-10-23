import type { SubscriptionResource } from "@watcher/common";
import { findOrFail, repositoryTypes, subscriptions, userSubscriptions } from "@watcher/database";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { is_uuid, parse_slug_params } from "#shared/utils/random";

type SubscriptionRow = repositoryTypes.subscriptions.SubscriptionWithUserState;
type SubscriptionIdentifier = repositoryTypes.subscriptions.SubscriptionIdentifier;

export default class SubscriptionsService extends AbstractService {
  async find_all(user: User): Promise<Array<SubscriptionResource>> {
    const rows = await subscriptions.find_all_by_user({ user_id: user.id });

    return rows.map((row) => this.to_resource(row));
  }

  async find_one(user: User, id_or_slug: string): Promise<SubscriptionResource> {
    const row = await findOrFail(
      subscriptions.find_one_by_user({
        user_id: user.id,
        identifier: this.to_identifier(id_or_slug),
      }),
      { message: "subscription_not_found" },
    );

    return this.to_resource(row);
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
    await userSubscriptions.toggle_favorite({
      user_id: user.id,
      identifier: this.to_identifier(id_or_slug),
    });
  }

  async hide(user: User, id_or_slug: string) {
    await userSubscriptions.hide({ user_id: user.id, identifier: this.to_identifier(id_or_slug) });
  }

  async show(user: User, id_or_slug: string) {
    await userSubscriptions.show({ user_id: user.id, identifier: this.to_identifier(id_or_slug) });
  }

  private to_identifier(id_or_slug: string): SubscriptionIdentifier {
    return is_uuid(id_or_slug) ? { id: id_or_slug } : { slug: parse_slug_params(id_or_slug) };
  }

  private to_resource(row: SubscriptionRow): SubscriptionResource {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      is_favorite: row.is_favorite,
      is_hidden: row.is_hidden,
      last_synced_at: row.last_synced_at,
      last_video_at: row.last_video_at,
      channel: {
        service: row.service,
        url: row.url,
        logo: row.logo,
      },
    };
  }
}
