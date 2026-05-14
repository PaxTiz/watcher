import { ofetch } from "ofetch";

import type { Twitch } from "../types";
import { type ClientSettings } from "./internal/client";
import { type TwitchServiceRequest, TwitchService } from "./internal/service";

export class FollowersService extends TwitchService {
  constructor(settings: ClientSettings) {
    super(settings);
  }

  async list(
    data: { user_id: string; cursor?: string },
    config: TwitchServiceRequest,
  ): Promise<Twitch["Followers"]["List"]> {
    return await this.perform_request(config.service_id, async (token) => {
      const url = new URL("https://api.twitch.tv/helix/channels/followed");
      url.searchParams.set("user_id", data.user_id);
      url.searchParams.set("first", "100");

      if (data.cursor) {
        url.searchParams.set("after", data.cursor);
      }

      return await ofetch<Twitch["Followers"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": this.settings.client_id,
        },
      });
    });
  }
}
