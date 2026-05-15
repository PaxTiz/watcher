import type { Google } from "@watcher/types";
import { ofetch } from "ofetch";

import type { ClientSettings } from "../internal/client";
import { GoogleService, type GoogleServiceRequest } from "../internal/service";

export class YoutubeChannelsService extends GoogleService {
  constructor(options: ClientSettings) {
    super(options);
  }

  async get_by_id(data: { channel_id: string }, config: GoogleServiceRequest) {
    return await this.perform_request(config.service_id, async (token) => {
      const url = new URL("https://www.googleapis.com/youtube/v3/channels");
      url.searchParams.set("id", data.channel_id);
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("access_token", token);

      const response = await ofetch<Google["Youtube"]["Channels"]["List"]>(url.toString());

      return response.items[0] ?? null;
    });
  }
}
