import type { Twitch } from "@watcher/types";
import { ofetch } from "ofetch";

import { type ClientSettings } from "./internal/client";
import { type TwitchServiceRequest, TwitchService } from "./internal/service";

export class UsersService extends TwitchService {
  constructor(settings: ClientSettings) {
    super(settings);
  }

  async list(
    data: { user_ids: Array<string> },
    config: TwitchServiceRequest,
  ): Promise<Twitch["Users"]["List"]> {
    return await this.perform_request(config.service_id, async (token) => {
      const url = new URL("https://api.twitch.tv/helix/users");
      for (const id of data.user_ids) {
        url.searchParams.append("id", id);
      }

      return await ofetch<Twitch["Users"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": this.settings.client_id,
        },
      });
    });
  }
}
