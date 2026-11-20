import type { UserResource } from "@watcher/common";
import {
  credentials,
  subscriptions,
  subscriptionsSync,
  userSubscriptions,
  withTransaction,
} from "@watcher/database";
import { GoogleInvalidGrantError } from "@watcher/integration-google";
import { formatISO } from "date-fns";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import { count_by_status } from "#server/utils/sync";
import { sync_subscription_logo } from "#server/utils/sync_images";
import type { Sync } from "#shared/types/sync";
import { async_pool } from "#shared/utils/random";
import { to_subscription_slug } from "#shared/utils/subscriptions";

const logger = () => useLogger("services.sync.youtube");

type User = Pick<UserResource, "id" | "integrations">;

export default class SyncYoutube extends AbstractService {
  async sync(user: User) {
    const started_at = Date.now();
    logger().info("YouTube sync started");

    const synced = await this.sync_subscriptions(user);
    if (!synced) {
      return;
    }

    const channels = await subscriptionsSync.find_all_for_user({
      user_id: user.id,
      service: "youtube",
    });
    const feeds = await services.feeds.youtube.check_channels(channels);
    const enriched = await services.feeds.youtube.enrich_pending();
    const images = await services.feeds.images.process_pending();

    logger().info(
      { ...synced, feeds, enriched, images, duration_ms: Date.now() - started_at },
      "YouTube sync finished",
    );
  }

  async sync_subscriptions(user: User) {
    this.assert_google(user);

    const token = await services.credentials.get(user.id, "google");
    if (!token) {
      logger().warn("No Google credentials: the YouTube sync is skipped");
      return null;
    }

    const subscriptions = await this.get_subscriptions(user).catch(async (error: unknown) => {
      if (error instanceof GoogleInvalidGrantError) {
        await credentials.mark_invalid({ service: "google", user_id: user.id });
        logger().warn("Google refresh token rejected: the integration must be reconnected");
      }

      throw error;
    });
    logger().info(
      {
        total: subscriptions.length,
        ...count_by_status(subscriptions),
      },
      "YouTube subscriptions fetched",
    );

    let failed = 0;
    await async_pool(subscriptions, 10, (sub) =>
      this.sync_subscription(user, sub).catch((error: unknown) => {
        failed++;
        logger().error(
          { err: error, channel_id: sub.channel.service_id, channel: sub.channel.name },
          "Failed to sync a YouTube subscription",
        );
      }),
    );

    return { total: subscriptions.length, failed };
  }

  private async get_subscriptions(user: User) {
    const google_id = this.assert_google(user);

    const google = useGoogle();

    const user_subscriptions: Sync["SubscriptionsList"] = await subscriptions
      .find_all_for_sync({ user_id: user.id, service: "youtube" })
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

    let response = await google.youtube.subscriptions.list({}, { service_id: google_id });
    let pages = 1;
    while (true) {
      for (const subscription of response.items ?? []) {
        const existing_subscription = user_subscriptions.find(
          (e) => e.channel.service_id === subscription.snippet.resourceId.channelId,
        );

        if (existing_subscription) {
          existing_subscription.status = "updated";
          existing_subscription.channel = {
            service: "youtube",
            service_id: subscription.snippet.resourceId.channelId,
            name: subscription.snippet.title,
            slug: to_subscription_slug("youtube", subscription.snippet.title),
            url: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
            logo: subscription.snippet.thumbnails.default.url,
            logo_local: existing_subscription.channel.logo,
            logo_etag: existing_subscription.channel.logo_etag,
            last_synced_at: formatISO(new Date()),
          };
        } else {
          user_subscriptions.push({
            status: "created",
            channel: {
              service: "youtube",
              service_id: subscription.snippet.resourceId.channelId,
              name: subscription.snippet.title,
              slug: to_subscription_slug("youtube", subscription.snippet.title),
              url: `https://www.youtube.com/channel/${subscription.snippet.resourceId.channelId}`,
              logo: subscription.snippet.thumbnails.default.url,
              logo_local: "",
              logo_etag: "",
              last_synced_at: formatISO(new Date()),
            },
          });
        }
      }

      if (response.nextPageToken) {
        pages++;
        logger().debug({ page: pages }, "Fetching the next page of YouTube subscriptions");

        response = await google.youtube.subscriptions.list(
          { cursor: response.nextPageToken },
          { service_id: google_id },
        );
      } else {
        break;
      }
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
        "YouTube subscription detached (no longer followed)",
      );

      return;
    }

    const started_at = Date.now();
    logger().debug(
      {
        channel_id: subscription.channel.service_id,
        channel: subscription.channel.name,
        status: subscription.status,
      },
      "Syncing YouTube subscription",
    );

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

    logger().debug(
      {
        channel_id: subscription.channel.service_id,
        channel: subscription.channel.name,
        duration_ms: Date.now() - started_at,
      },
      "YouTube subscription synced",
    );
  }

  private assert_google(user: User): string {
    if (!user.integrations.google) {
      throw new Error("Google integration not available for user");
    }

    return user.integrations.google!;
  }
}
