import type { Twitch } from "@watcher/common";
import { ofetch } from "ofetch";

import type { TwitchClient } from "./internal/client";
import { helix_options } from "./internal/helix";
import { TwitchService } from "./internal/service";

export const MAX_STREAMS_PER_REQUEST = 100;

export class StreamsService extends TwitchService {
  constructor(client: TwitchClient) {
    super(client);
  }

  async list(data: { user_ids: Array<string> }): Promise<Twitch["Streams"]["List"]["data"]> {
    if (data.user_ids.length === 0) {
      return [];
    }

    if (data.user_ids.length > MAX_STREAMS_PER_REQUEST) {
      throw new Error(`At most ${MAX_STREAMS_PER_REQUEST} channels per request`);
    }

    return await this.perform_app_request(async (token) => {
      const url = new URL("https://api.twitch.tv/helix/streams");
      url.searchParams.set("type", "live");
      url.searchParams.set("first", String(MAX_STREAMS_PER_REQUEST));
      for (const id of data.user_ids) {
        url.searchParams.append("user_id", id);
      }

      const response = await ofetch<Twitch["Streams"]["List"]>(
        url.toString(),
        helix_options(this.client, token, { app: true }),
      );

      return response.data;
    });
  }
}
