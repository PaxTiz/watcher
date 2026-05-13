import { AbstractService } from "#framework";
import type { Twitch } from "#shared/types/twitch";

export default class TwitchUsersService extends AbstractService {
  async list(params: {
    token: string;
    clientId: string;
    userIds: Array<string>;
  }): Promise<Twitch["Users"]["List"]> {
    try {
      const url = new URL("https://api.twitch.tv/helix/users");
      for (const id of params.userIds) {
        url.searchParams.append("id", id);
      }

      return await $fetch<Twitch["Users"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${params.token}`,
          "Client-Id": params.clientId,
        },
      });
    } catch (e) {
      throw new Error("Failed to fetch users by their ids", { cause: e });
    }
  }
}
