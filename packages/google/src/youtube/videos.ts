import { request_options, type Google } from "@watcher/common";
import { ofetch } from "ofetch";

import type { GoogleClient } from "../internal/client";
import { GoogleService } from "../internal/service";
import { to_playlist_id } from "./playlist_items";

export class YoutubeVideosService extends GoogleService {
  constructor(client: GoogleClient) {
    super(client);
  }

  async get_latests(data: { channel_id: string }) {
    const playlist_videos = await this.client.youtube.playlist_items.list({
      playlist_id: to_playlist_id(data.channel_id, "uploads"),
    });

    const video_ids = playlist_videos.map((v) => v.contentDetails.videoId);

    return await this.get_by_ids({ video_ids });
  }

  async get_by_ids(data: { video_ids: Array<string> }) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "contentDetails,snippet");
    url.searchParams.set("id", data.video_ids.join(","));
    url.searchParams.set("key", this.client.settings.api_key);

    const response = await ofetch<Google["Youtube"]["Videos"]["List"]>(
      url.toString(),
      request_options(),
    );

    return response.items;
  }
}
