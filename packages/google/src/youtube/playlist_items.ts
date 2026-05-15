import type { Google } from "@watcher/types";
import { ofetch } from "ofetch";

import type { ClientSettings } from "../internal/client";
import { GoogleService, type GoogleServiceRequest } from "../internal/service";
import { YoutubeChannelsService } from "./channels";

export class YoutubePlaylistItemsService extends GoogleService {
  constructor(options: ClientSettings) {
    super(options);
  }

  async get_uploads_id(data: { channel_id: string }, config: GoogleServiceRequest) {
    return await this.perform_request(config.service_id, async (token) => {
      const channel = await new YoutubeChannelsService(this.settings).get_by_id(
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
      url.searchParams.set("access_token", token);

      const response = await ofetch<Google["Youtube"]["PlaylistItems"]["List"]>(url.toString());

      return response.items;
    });
  }
}
