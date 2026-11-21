import type {
  SubscriptionDetailsResource,
  SubscriptionResource,
  SubscriptionsSyncResource,
} from "@watcher/common";
import {
  findOrFail,
  repositoryTypes,
  subscriptions,
  userSubscriptions,
  userSyncs,
} from "@watcher/database";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { public_image_url } from "#server/utils/images";
import { is_sync_running, type SyncOptions } from "#server/utils/sync";
import { is_uuid, parse_slug_params } from "#shared/utils/random";

type SubscriptionRow = repositoryTypes.subscriptions.SubscriptionWithUserState;
type SubscriptionIdentifier = repositoryTypes.subscriptions.SubscriptionIdentifier;

export default class SubscriptionsService extends AbstractService {
  async find_all(user: User): Promise<Array<SubscriptionResource>> {
    const rows = await subscriptions.find_all_by_user({ user_id: user.id });

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

  async sync(user: User, options: SyncOptions = { full: false }) {
    useLogger("services.subscriptions").info(
      { google: !!user.integrations.google, twitch: !!user.integrations.twitch, ...options },
      "Subscriptions sync requested",
    );

    const sync = [];
    if (user.integrations.google) {
      sync.push(services.sync.youtube.sync(user, options));
    }
    if (user.integrations.twitch) {
      sync.push(services.sync.twitch.sync(user, options));
    }

    await Promise.all(sync);
  }

  async sync_state(user: User): Promise<SubscriptionsSyncResource> {
    const state = await userSyncs.find({ user_id: user.id });

    if (!state) {
      return { status: "idle", error: null };
    }

    if (is_sync_running(state)) {
      return { status: "running", error: null };
    }

    if (!state.finished_at) {
      return { status: "failed", error: "sync_failed" };
    }

    return state.error ? { status: "failed", error: state.error } : { status: "done", error: null };
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

  to_resource(row: SubscriptionRow): SubscriptionResource {
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
