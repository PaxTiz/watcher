import type { SubscriptionDetailsResource, SubscriptionResource } from "@watcher/common";
import { findOrFail, repositoryTypes, subscriptions, userSubscriptions } from "@watcher/database";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { public_image_url } from "#server/utils/images";
import { is_uuid, parse_slug_params } from "#shared/utils/random";
import type { SubscriptionsValidators } from "#shared/validators/subscriptions";

type SubscriptionRow = repositoryTypes.subscriptions.SubscriptionWithUserState;
type SubscriptionIdentifier = repositoryTypes.subscriptions.SubscriptionIdentifier;

export default class SubscriptionsService extends AbstractService {
  async find_all(
    user: User,
    params: SubscriptionsValidators["list"]["query"],
  ): Promise<Array<SubscriptionResource>> {
    const rows = await subscriptions.find_all_by_user({
      user_id: user.id,
      query: params.query,
    });

    return rows.map((row) => this.to_resource(row));
  }

  async find_one(user: User, id_or_slug: string): Promise<SubscriptionDetailsResource> {
    const row = await findOrFail(
      subscriptions.find_one_by_user({
        user_id: user.id,
        identifier: this.to_identifier(id_or_slug),
      }),
      { message: "subscription_not_found" },
    );

    const resource = this.to_resource(row);

    return { ...resource, channel: { ...resource.channel, url: row.url } };
  }

  async sync(user: User) {
    useLogger("services.subscriptions").info(
      { google: !!user.integrations.google, twitch: !!user.integrations.twitch },
      "Subscriptions sync requested",
    );

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

    useLogger("services.subscriptions").debug({ id_or_slug }, "Subscription favorite toggled");
  }

  async hide(user: User, id_or_slug: string) {
    await userSubscriptions.hide({ user_id: user.id, identifier: this.to_identifier(id_or_slug) });

    useLogger("services.subscriptions").debug({ id_or_slug }, "Subscription hidden");
  }

  async show(user: User, id_or_slug: string) {
    await userSubscriptions.show({ user_id: user.id, identifier: this.to_identifier(id_or_slug) });

    useLogger("services.subscriptions").debug({ id_or_slug }, "Subscription shown");
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
      last_video_at: row.is_hidden ? null : row.last_video_at,
      channel: {
        service: row.service,
        logo: public_image_url(row.logo),
      },
    };
  }
}
