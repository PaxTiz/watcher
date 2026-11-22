import type { UserResource } from "@watcher/common";
import { credentials, subscriptions, userSubscriptions, withTransaction } from "@watcher/database";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { is_invalid_grant, SYNC_CREDENTIALS, type SyncService } from "#server/utils/sync";
import { sync_subscription_logo } from "#server/utils/sync_images";
import { async_pool } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

const logger = () => useLogger("services.sync.subscriptions");

type User = Pick<UserResource, "id" | "integrations">;

type StoredChannel = Awaited<ReturnType<typeof subscriptions.find_all_for_sync>>[number];

export type FollowedChannel = { service_id: string; name: string; url: string; logo: string };

export default class SyncSubscriptions extends AbstractService {
  async sync(user: User, service: SyncService) {
    const credential = SYNC_CREDENTIALS[service];

    const token = await services.credentials.get(user.id, credential);
    if (!token) {
      logger().warn({ service }, "No credentials: the subscriptions sync is skipped");
      return null;
    }

    const followed = await this.list_followed(user, service, token.service_id).catch(
      async (error: unknown) => {
        if (is_invalid_grant(error)) {
          await credentials.mark_invalid({ service: credential, user_id: user.id });
          logger().warn({ service }, "Refresh token rejected: the integration must be reconnected");
        }

        throw error;
      },
    );

    const stored = await subscriptions.find_all_for_sync({ user_id: user.id, service });
    const stored_by_id = new Map(stored.map((channel) => [channel.service_id, channel]));
    const followed_ids = new Set(followed.map((channel) => channel.service_id));
    const unfollowed = stored.filter((channel) => !followed_ids.has(channel.service_id));

    const created = followed.filter((channel) => !stored_by_id.has(channel.service_id)).length;
    logger().info(
      {
        service,
        total: followed.length,
        created,
        updated: followed.length - created,
        deleted: unfollowed.length,
      },
      "Subscriptions fetched",
    );

    let failed = 0;
    const created_ids = new Set<string>();

    await async_pool(unfollowed, 10, (channel) =>
      this.detach(user, channel).catch((error: unknown) => {
        failed++;
        logger().error(
          { err: error, service, channel_id: channel.service_id, channel: channel.name },
          "Failed to detach a subscription",
        );
      }),
    );

    await async_pool(followed, 10, (channel) =>
      this.attach(user, service, channel, stored_by_id.get(channel.service_id))
        .then((created_id) => created_id && created_ids.add(created_id))
        .catch((error: unknown) => {
          failed++;
          logger().error(
            { err: error, service, channel_id: channel.service_id, channel: channel.name },
            "Failed to sync a subscription",
          );
        }),
    );

    return { total: followed.length, failed, created_ids };
  }

  private list_followed(user: User, service: SyncService, token_service_id: string) {
    return service === "youtube"
      ? services.sync.youtube.list_followed(user)
      : services.sync.twitch.list_followed(user, token_service_id);
  }

  private async detach(user: User, channel: StoredChannel) {
    await userSubscriptions.detach({
      user_id: user.id,
      service: channel.service,
      service_id: channel.service_id,
    });

    logger().info(
      { service: channel.service, channel_id: channel.service_id, channel: channel.name },
      "Subscription detached (no longer followed)",
    );
  }

  private async attach(
    user: User,
    service: SyncService,
    channel: FollowedChannel,
    stored: StoredChannel | undefined,
  ) {
    const logo = await sync_subscription_logo(
      { service, service_id: channel.service_id, logo: channel.logo },
      { path: stored?.logo ?? "", etag: stored?.logo_etag ?? "" },
    );

    const upserted = await withTransaction(async (tx) => {
      const subscription = await subscriptions.upsert({
        data: {
          service,
          service_id: channel.service_id,
          name: channel.name,
          slug: to_subscription_slug(service, channel.name),
          url: channel.url,
          logo: logo.path,
          logo_etag: logo.etag,
          last_synced_at: new Date().toISOString(),
        },
        options: { tx },
      });

      await userSubscriptions.attach({
        user_id: user.id,
        subscription_id: subscription.id,
        options: { tx },
      });

      return subscription;
    });

    return upserted.created ? upserted.id : null;
  }
}
