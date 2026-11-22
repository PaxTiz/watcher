import type { Twitch } from "@watcher/common";
import { ofetch } from "ofetch";

import type { TwitchClient } from "./internal/client";
import { helix_options } from "./internal/helix";
import { TwitchService } from "./internal/service";

const EVENTSUB_URL = "https://api.twitch.tv/helix/eventsub/subscriptions";

export class EventsubService extends TwitchService {
  constructor(client: TwitchClient) {
    super(client);
  }

  async list(data: { type: string; cursor?: string }): Promise<Twitch["Eventsub"]["List"]> {
    return await this.perform_app_request(async (token) => {
      const url = new URL(EVENTSUB_URL);
      url.searchParams.set("type", data.type);

      if (data.cursor) {
        url.searchParams.set("after", data.cursor);
      }

      return await ofetch<Twitch["Eventsub"]["List"]>(
        url.toString(),
        helix_options("twitch.helix.eventsub.list", this.client, token, { app: true }),
      );
    });
  }

  async create(data: {
    type: string;
    broadcaster_user_id: string;
    callback: string;
    secret: string;
  }) {
    await this.perform_app_request(async (token) => {
      await ofetch(EVENTSUB_URL, {
        ...helix_options("twitch.helix.eventsub.create", this.client, token, { app: true }),
        method: "POST",
        body: {
          type: data.type,
          version: "1",
          condition: { broadcaster_user_id: data.broadcaster_user_id },
          transport: { method: "webhook", callback: data.callback, secret: data.secret },
        },
      });
    });
  }

  async remove(data: { id: string }) {
    await this.perform_app_request(async (token) => {
      const url = new URL(EVENTSUB_URL);
      url.searchParams.set("id", data.id);

      await ofetch(url.toString(), {
        ...helix_options("twitch.helix.eventsub.delete", this.client, token, { app: true }),
        method: "DELETE",
      });
    });
  }
}
