import type { UserResource } from "@watcher/common";
import { subscriptionsSync } from "@watcher/database";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { useGoogle } from "#server/lib/google";
import type { FollowedChannel } from "#server/lib/services/sync/subscriptions";
import { channels_to_sync, type SyncOptions } from "#server/utils/sync";

const logger = () => useLogger("services.sync.youtube");

type User = Pick<UserResource, "id" | "integrations">;

export default class SyncYoutube extends AbstractService {
  async sync(user: User, options: SyncOptions) {
    const started_at = Date.now();
    logger().info("YouTube sync started");

    const synced = await services.sync.subscriptions.sync(user, "youtube");
    if (!synced) {
      return;
    }
    const { created_ids, ...counts } = synced;

    const channels = channels_to_sync(
      await subscriptionsSync.find_all_for_user({ user_id: user.id, service: "youtube" }),
      options,
      created_ids,
    );
    const feeds = await services.feeds.youtube.check_channels(channels, options);
    const enriched = await services.feeds.youtube.enrich_pending();
    const images = await services.feeds.images.process_pending();

    logger().info(
      {
        ...counts,
        created: created_ids.size,
        channels: options.channels,
        feeds,
        enriched,
        images,
        duration_ms: Date.now() - started_at,
      },
      "YouTube sync finished",
    );
  }

  async list_followed(user: User) {
    if (!user.integrations.google) {
      throw new Error("Google integration not available for user");
    }

    const google = useGoogle();
    const config = { service_id: user.integrations.google };
    const followed: Array<FollowedChannel> = [];

    let cursor: string | undefined;
    do {
      const response = await google.youtube.subscriptions.list({ cursor }, config);

      for (const { snippet } of response.items ?? []) {
        followed.push({
          service_id: snippet.resourceId.channelId,
          name: snippet.title,
          url: `https://www.youtube.com/channel/${snippet.resourceId.channelId}`,
          logo: snippet.thumbnails.default.url,
        });
      }

      cursor = response.nextPageToken ?? undefined;
    } while (cursor);

    return followed;
  }
}
