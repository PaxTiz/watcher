import { AbstractService } from "#framework";
import type { Youtube } from "#shared/types/youtube";

export default class GoogleYoutubeVideosService extends AbstractService {
  async get_latest_videos(token: string, channel_id: string, cursor?: string) {
    try {
      const playlist_videos = await this.get_uploads_playlist_id(token, channel_id);
      const video_ids = playlist_videos.map((v) => v.contentDetails!.videoId!);

      return await this.get_videos_by_ids(token, video_ids, cursor);
    } catch (e) {
      throw new Error(`Failed to get latest Youtube videos for channel #${channel_id}`, {
        cause: e,
      });
    }
  }

  private async get_videos_by_ids(token: string, video_ids: Array<string>, cursor?: string) {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "contentDetails,snippet");
      url.searchParams.set("id", video_ids.join(","));
      url.searchParams.set("access_token", token);

      if (cursor) {
        url.searchParams.set("pageToken", cursor);
      }

      const response = await $fetch<Youtube["Videos"]["List"]>(url.toString());

      return response;
    } catch (e) {
      throw new Error("Failed to get multiple YouTube videos by their IDs", { cause: e });
    }
  }

  private async get_uploads_playlist_id(token: string, channel_id: string) {
    try {
      const channel = await this.get_channel_by_id(token, channel_id);

      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("playlistId", channel.contentDetails.relatedPlaylists.uploads);
      url.searchParams.set("access_token", token);

      const response = await $fetch<Youtube["PlaylistItems"]["List"]>(url.toString());

      return response.items;
    } catch (e) {
      throw new Error(`Failed to get YouTube playlists for channel #${channel_id}`, { cause: e });
    }
  }

  private async get_channel_by_id(token: string, channel_id: string) {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/channels");
      url.searchParams.set("id", channel_id);
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("access_token", token);

      const response = await $fetch<Youtube["Channels"]["List"]>(url.toString());

      if (response.pageInfo.totalResults !== 1) {
        throw new Error("Failed to get single YouTube channel by id: invalid results count");
      }

      return response.items[0]!;
    } catch (e) {
      throw new Error(`Failed to get YouTube channel #${channel_id}`, { cause: e });
    }
  }
}
