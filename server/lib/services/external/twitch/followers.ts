import { AbstractService } from "#framework";
import { services } from "#framework/server";
import type { Twitch } from "#shared/types/twitch";

export default class TwitchFollowersService extends AbstractService {
  async list(params: {
    token: string;
    clientId: string;
    userId: string;
    cursor?: string;
  }): Promise<Twitch["Followers"]["List"]> {
    try {
      const url = new URL("https://api.twitch.tv/helix/channels/followed");
      url.searchParams.set("user_id", params.userId);
      url.searchParams.set("first", "100");

      if (params.cursor) {
        url.searchParams.set("after", params.cursor);
      }

      const followers = await $fetch<Twitch["Followers"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${params.token}`,
          "Client-Id": params.clientId,
        },
      });

      const users = await services.external.twitch.users.list({
        clientId: params.clientId,
        token: params.token,
        userIds: followers.data.map((e) => e.broadcaster_id),
      });

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
