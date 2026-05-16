import type { Google } from "@watcher/types";
import { ofetch } from "ofetch";

import type { GoogleClient } from "../internal/client";
import { GoogleService, type GoogleServiceRequest } from "../internal/service";

export class YoutubeSubscriptionsService extends GoogleService {
  constructor(client: GoogleClient) {
    super(client);
  }

  async list(data: { cursor?: string }, config: GoogleServiceRequest) {
    return await this.perform_request(config.service_id, async (token) => {
      const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("mine", "true");
      url.searchParams.set("maxResults", "50");

      if (data.cursor) {
        url.searchParams.set("pageToken", data.cursor);
      }

      return await ofetch<Google["Youtube"]["Subscriptions"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });
  }
}
