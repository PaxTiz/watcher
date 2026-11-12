import type { Twitch } from "@watcher/common";

import { AbstractService, useLogger } from "#framework";
import { useTwitch } from "#server/lib/twitch";

export default class TwitcHelpersService extends AbstractService {
  async get_followers(
    params: {
      user_id: string;
      cursor?: string;
    },
    config: { service_id: string },
  ): Promise<Twitch["Followers"]["List"]> {
    try {
      const twitch = useTwitch();

      const followers = await twitch.followers.list(
        {
          user_id: params.user_id,
          cursor: params.cursor,
        },
        { service_id: config.service_id },
      );

      const users = await twitch.users.list(
        {
          user_ids: followers.data.map((e) => e.broadcaster_id),
        },
        { service_id: config.service_id },
      );

      for (const follower of followers.data) {
        const user = users.data.find((e) => e.id === follower.broadcaster_id);
        if (!user) {
          useLogger("services.external.twitch.helpers").warn(
            { broadcaster_id: follower.broadcaster_id },
            "Followed broadcaster missing from the Twitch users response",
          );
        }

        follower.logo = user!.profile_image_url;
      }

      return followers;
    } catch (e) {
      useLogger("services.external.twitch.helpers").error(
        { err: e, user_id: params.user_id, cursor: params.cursor },
        "Failed to fetch the Twitch follows",
      );
      throw new Error("Failed to fetch user follows", { cause: e });
    }
  }
}
