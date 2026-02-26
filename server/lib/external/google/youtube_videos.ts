import { youtube_v3 } from "googleapis";

export default class GoogleYoutubeVideosService {
  async get_latest_videos(token: string, channel_id: string) {
    try {
      const playlist_videos = await this.get_uploads_playlist_id(token, channel_id);
      const video_ids = playlist_videos.map((v) => v.contentDetails!.videoId!);

      const videos = await this.get_videos_by_ids(token, video_ids);
      return videos.data.items!;
    } catch (e) {
      throw new Error(`Failed to get latest Youtube videos for channel #${channel_id}`, {
        cause: e,
      });
    }
  }

  private async get_videos_by_ids(token: string, video_ids: Array<string>) {
    const client = new youtube_v3.Youtube({});

    try {
      const response = await client.videos.list({
        part: ["contentDetails", "snippet"],
        id: video_ids,
        access_token: token,
      });

      return response;
    } catch (e) {
      throw new Error("Failed to get multiple YouTube videos by their IDs", { cause: e });
    }
  }

  private async get_uploads_playlist_id(token: string, channel_id: string) {
    const client = new youtube_v3.Youtube({});

    try {
      const channel = await this.get_channel_by_id(token, channel_id);
      const response = await client.playlistItems.list({
        maxResults: 50,
        part: ["snippet", "contentDetails"],
        playlistId: channel.contentDetails!.relatedPlaylists!.uploads,
        access_token: token,
      });

      return response.data.items!;
    } catch (e) {
      throw new Error(`Failed to get YouTube playlists for channel #${channel_id}`, { cause: e });
    }
  }

  private async get_channel_by_id(token: string, channel_id: string) {
    const client = new youtube_v3.Youtube({});

    try {
      const response = await client.channels.list({
        part: ["contentDetails"],
        id: [channel_id],
        access_token: token,
      });

      if (response.data.pageInfo?.totalResults !== 1) {
        throw new Error("Failed to get single YouTube channel by id: invalid results count");
      }

      return response.data.items![0]!;
    } catch (e) {
      throw new Error(`Failed to get YouTube channel #${channel_id}`, { cause: e });
    }
  }
}
