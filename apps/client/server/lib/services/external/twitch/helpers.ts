import { AbstractService } from "#framework";
import { useTwitch } from "#server/lib/twitch";
import type { Twitch } from "#shared/types/twitch";

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
        const user = users.data.find((e) => e.id === follower.broadcaster_id)!;
        follower.logo = user.profile_image_url;
      }

      return followers;
    } catch (e) {
      throw new Error("Failed to fetch user follows", { cause: e });
    }
  }
}
