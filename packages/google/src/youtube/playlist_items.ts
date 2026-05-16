import type { Google } from "@watcher/types";
import { ofetch } from "ofetch";

import type { GoogleClient } from "../internal/client";
import { GoogleService, type GoogleServiceRequest } from "../internal/service";

export class YoutubePlaylistItemsService extends GoogleService {
  constructor(client: GoogleClient) {
    super(client);
  }

  async get_uploads_id(data: { channel_id: string }, config: GoogleServiceRequest) {
    return await this.perform_request(config.service_id, async (token) => {
      const channel = await this.client.youtube.channels.get_by_id(
        { channel_id: data.channel_id },
        { service_id: config.service_id },
      );

      if (!channel) {
        throw new Error(`Youtube channel '${data.channel_id}' not found`);
      }

      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("playlistId", channel.contentDetails.relatedPlaylists.uploads);

      const response = await ofetch<Google["Youtube"]["PlaylistItems"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.items;
    });
  }
}
