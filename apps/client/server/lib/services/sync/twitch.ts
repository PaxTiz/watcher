import type { UserResource } from "@watcher/common";
import { subscriptionsSync } from "@watcher/database";

import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import type { FollowedChannel } from "#server/lib/services/sync/subscriptions";
import { channels_to_sync, type SyncOptions } from "#server/utils/sync";

const logger = () => useLogger("services.sync.twitch");

type User = Pick<UserResource, "id" | "integrations">;

export default class SyncTwitch extends AbstractService {
  async sync(user: User, options: SyncOptions) {
    const started_at = Date.now();
    logger().info("Twitch sync started");

    const synced = await services.sync.subscriptions.sync(user, "twitch");
    if (!synced) {
      return;
    }
    const { created_ids, ...counts } = synced;

    const channels = channels_to_sync(
      await subscriptionsSync.find_all_for_user({ user_id: user.id, service: "twitch" }),
      options,
      created_ids,
    );
    const feeds = await services.feeds.twitch.check_channels(channels, {
      full: options.full,
      all_vods: true,
    });

    logger().info(
      {
        ...counts,
        created: created_ids.size,
        channels: options.channels,
        feeds,
        duration_ms: Date.now() - started_at,
      },
      "Twitch sync finished",
    );
  }

  async list_followed(user: User, user_id: string) {
    if (!user.integrations.twitch) {
      throw new Error("Twitch integration not available for user");
    }

    const config = { service_id: user.integrations.twitch };
    const followed: Array<FollowedChannel> = [];

    let cursor: string | undefined;
    do {
      const response = await services.external.twitch.helpers.get_followers(
        { user_id, cursor },
        config,
      );

      for (const channel of response.data) {
        followed.push({
          service_id: channel.broadcaster_id,
          name: channel.broadcaster_name,
          url: `https://www.twitch.tv/${channel.broadcaster_login}`,
          logo: channel.logo,
        });
      }

      cursor = response.pagination.cursor;
    } while (cursor);

    return followed;
  }
}
