import type { UserResource } from "@watcher/common";
import {
  credentials,
  subscriptions,
  subscriptionsSync,
  userSubscriptions,
  withTransaction,
} from "@watcher/database";
import { TwitchInvalidGrantError } from "@watcher/integration-twitch";
import { formatISO } from "date-fns";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { count_by_status, type SyncOptions } from "#server/utils/sync";
import { sync_subscription_logo } from "#server/utils/sync_images";
import type { Sync } from "#shared/types/sync";
import { async_pool } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

const logger = () => useLogger("services.sync.twitch");

type User = Pick<UserResource, "id" | "integrations">;

export default class SyncTwitch extends AbstractService {
  async sync(user: User, options: SyncOptions) {
    const started_at = Date.now();
    logger().info("Twitch sync started");

    const synced = await this.sync_subscriptions(user);
    if (!synced) {
      return;
    }

    const scheduled = await subscriptionsSync.find_all_for_user({
      user_id: user.id,
      service: "twitch",
    });
    const lives = await services.feeds.twitch.check_lives(scheduled);

    const channels = await subscriptionsSync.find_all_for_user({
      user_id: user.id,
      service: "twitch",
    });
    const vods = { read: channels.length, stored: 0, deleted: 0, failed: 0 };
    await async_pool(channels, 5, async (channel) => {
      try {
        const result = await services.feeds.twitch.read_vods(channel, options);
        vods.stored += result.stored;
        vods.deleted += result.deleted;
      } catch (error) {
        vods.failed++;
        logger().error(
          { err: error, channel_id: channel.service_id, channel: channel.name },
          "Failed to read the VODs of a Twitch channel",
        );
      }
    });

    const images = await services.feeds.images.process_pending();

    logger().info(
      { ...synced, lives, vods, images, duration_ms: Date.now() - started_at },
      "Twitch sync finished",
    );
  }

  async sync_subscriptions(user: User) {
    const twitch_id = this.assert_twitch(user);

    const token = await services.credentials.get(user.id, "twitch");
    if (!token) {
      logger().warn("No Twitch credentials: the Twitch sync is skipped");
      return null;
    }

    const subscriptions = await this.get_subscriptions(user, token.service_id, twitch_id).catch(
      async (error: unknown) => {
        if (error instanceof TwitchInvalidGrantError) {
          await credentials.mark_invalid({ service: "twitch", user_id: user.id });
          logger().warn("Twitch refresh token rejected: the integration must be reconnected");
        }

        throw error;
      },
    );
    logger().info(
      { total: subscriptions.length, ...count_by_status(subscriptions) },
      "Twitch subscriptions fetched",
    );

    let failed = 0;
    await async_pool(subscriptions, 10, (sub) =>
      this.sync_subscription(user, sub).catch((error: unknown) => {
        failed++;
        logger().error(
          { err: error, channel_id: sub.channel.service_id, channel: sub.channel.name },
          "Failed to sync a Twitch subscription",
        );
      }),
    );

    return { total: subscriptions.length, failed };
  }

  private async get_subscriptions(user: User, service_id: string, twitch_id: string) {
    const user_subscriptions: Sync["SubscriptionsList"] = await subscriptions
      .find_all_for_sync({ user_id: user.id, service: "twitch" })
      .then((subs) =>
        subs.map((sub) => ({
          status: "deleted",
          channel: {
            service: sub.service,
            service_id: sub.service_id,
            name: sub.name,
            slug: sub.slug,
            url: sub.url,
            logo: sub.logo,
            logo_local: sub.logo,
            logo_etag: sub.logo_etag,
            last_synced_at: sub.last_synced_at,
          },
        })),
      );

    let response = await services.external.twitch.helpers.get_followers(
      { user_id: service_id },
      { service_id: twitch_id },
    );
    let pages = 1;

    while (true) {
      for (const subscription of response.data) {
        const existing_subscription = user_subscriptions.find(
          (e) => e.channel.service_id === subscription.broadcaster_id,
        );

        const channel = {
          service: "twitch" as const,
          service_id: subscription.broadcaster_id,
          name: subscription.broadcaster_name,
          slug: to_subscription_slug("twitch", subscription.broadcaster_name),
          url: `https://www.twitch.tv/${subscription.broadcaster_login}`,
          logo: subscription.logo,
          last_synced_at: formatISO(new Date()),
        };

        if (existing_subscription) {
          existing_subscription.status = "updated";
          existing_subscription.channel = {
            ...channel,
            logo_local: existing_subscription.channel.logo,
            logo_etag: existing_subscription.channel.logo_etag,
          };
        } else {
          user_subscriptions.push({
            status: "created",
            channel: { ...channel, logo_local: "", logo_etag: "" },
          });
        }
      }

      if (!response.pagination.cursor) {
        break;
      }

      pages++;
      logger().debug({ page: pages }, "Fetching the next page of Twitch follows");

      response = await services.external.twitch.helpers.get_followers(
        { user_id: service_id, cursor: response.pagination.cursor },
        { service_id: twitch_id },
      );
    }

    return user_subscriptions;
  }

  private async sync_subscription(user: User, subscription: Sync["Subscription"]) {
    if (subscription.status === "deleted") {
      await userSubscriptions.detach({
        user_id: user.id,
        service: subscription.channel.service,
        service_id: subscription.channel.service_id,
      });

      logger().info(
        { channel_id: subscription.channel.service_id, channel: subscription.channel.name },
        "Twitch subscription detached (no longer followed)",
      );

      return;
    }

    const logo = await sync_subscription_logo(subscription);
    subscription.channel.logo = logo.path;
    subscription.channel.logo_etag = logo.etag;

    await withTransaction(async (tx) => {
      const { logo_local, ...subscription_data } = subscription.channel;
      const patched_subscription = await subscriptions.upsert({
        data: subscription_data,
        options: { tx },
      });

      await userSubscriptions.attach({
        user_id: user.id,
        subscription_id: patched_subscription.id,
        options: { tx },
      });
    });
  }

  private assert_twitch(user: User): string {
    if (!user.integrations.twitch) {
      throw new Error("Twitch integration not available for user");
    }

    return user.integrations.twitch!;
  }
}
