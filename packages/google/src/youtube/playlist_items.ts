import { request_options, type Google } from "@watcher/common";
import { ofetch } from "ofetch";

import type { GoogleClient } from "../internal/client";
import { GoogleService } from "../internal/service";

const playlist_prefixes = {
  uploads: "UU",
  videos: "UULF",
  lives: "UULV",
} as const;

export const to_playlist_id = (channel_id: string, kind: keyof typeof playlist_prefixes) =>
  playlist_prefixes[kind] + channel_id.slice(2);

export class YoutubePlaylistItemsService extends GoogleService {
  constructor(client: GoogleClient) {
    super(client);
  }

  async list(data: { playlist_id: string }) {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", data.playlist_id);

    const response = await ofetch<Google["Youtube"]["PlaylistItems"]["List"]>(url.toString(), {
      ...request_options(),
      headers: { "X-Goog-Api-Key": this.client.settings.api_key },
    });

    return response.items;
  }
}
