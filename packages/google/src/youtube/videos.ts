import type { Google } from "@watcher/types";
import { ofetch } from "ofetch";

import type { ClientSettings } from "../internal/client";
import { GoogleService, type GoogleServiceRequest } from "../internal/service";
import { YoutubePlaylistItemsService } from "./playlist_items";

export class YoutubeVideosService extends GoogleService {
  constructor(options: ClientSettings) {
    super(options);
  }

  async get_latests(data: { channel_id: string; cursor?: string }, config: GoogleServiceRequest) {
    const playlist_videos = await new YoutubePlaylistItemsService(this.settings).get_uploads_id(
      { channel_id: data.channel_id },
      config,
    );

    const video_ids = playlist_videos.map((v) => v.contentDetails!.videoId!);

    return await this.get_by_ids({ video_ids, cursor: data.cursor }, config);
  }

  private async get_by_ids(
    data: { video_ids: Array<string>; cursor?: string },
    config: GoogleServiceRequest,
  ) {
    return await this.perform_request(config.service_id, async (token) => {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "contentDetails,snippet");
      url.searchParams.set("id", data.video_ids.join(","));
      url.searchParams.set("access_token", token);

      if (data.cursor) {
        url.searchParams.set("pageToken", data.cursor);
      }

      const response = await ofetch<Google["Youtube"]["Videos"]["List"]>(url.toString());

      return response;
    });
  }
}
