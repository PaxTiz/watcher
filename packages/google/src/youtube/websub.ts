import { request_options } from "@watcher/common";
import { ofetch } from "ofetch";

import type { GoogleClient } from "../internal/client";
import { GoogleService } from "../internal/service";

const HUB_URL = "https://pubsubhubbub.appspot.com/subscribe";

export const LEASE_SECONDS = 5 * 24 * 60 * 60;

export const to_websub_topic = (channel_id: string) =>
  `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channel_id}`;

export class YoutubeWebsubService extends GoogleService {
  constructor(client: GoogleClient) {
    super(client);
  }

  async subscribe(data: { channel_id: string; callback: string; secret: string }) {
    await ofetch(HUB_URL, {
      ...request_options("youtube.websub.subscribe"),
      method: "POST",
      body: new URLSearchParams({
        "hub.mode": "subscribe",
        "hub.topic": to_websub_topic(data.channel_id),
        "hub.callback": data.callback,
        "hub.verify": "async",
        "hub.secret": data.secret,
        "hub.lease_seconds": String(LEASE_SECONDS),
      }),
    });
  }
}
