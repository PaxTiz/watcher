import { AbstractService } from "#framework";
import type { Twitch } from "#shared/types/twitch";
import { isAfter } from "date-fns";

const DEFAULT_RESOLUTIONS = {
  chunked: { name: "Source", resolution: "chunked", frameRate: 60 },
  "1440p60": { name: "1440p60", resolution: "2560x1440", frameRate: 60 },
  "1080p60": { name: "1080p60", resolution: "1920x1080", frameRate: 60 },
  "720p60": { name: "720p60", resolution: "1280x720", frameRate: 60 },
  "480p30": { name: "480p", resolution: "854x480", frameRate: 30 },
  "360p30": { name: "360p", resolution: "640x360", frameRate: 30 },
  "160p30": { name: "160p", resolution: "284x160", frameRate: 30 },
};

export default class TwitchVideosService extends AbstractService {
  async list(params: {
    token: string;
    clientId: string;
    userId: string;
    cursor?: string;
  }): Promise<Twitch["Videos"]["List"]> {
    try {
      const url = new URL("https://api.twitch.tv/helix/videos");
      url.searchParams.set("first", "100");
      url.searchParams.set("archive", "archive");
      url.searchParams.set("sort", "time");
      url.searchParams.set("period", "all");
      url.searchParams.set("user_id", params.userId);

      if (params.cursor) {
        url.searchParams.set("after", params.cursor);
      }

      return await $fetch<Twitch["Videos"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${params.token}`,
          "Client-Id": params.clientId,
        },
      });
    } catch (e) {
      throw new Error("Failed to fetch videos by streamer id", { cause: e });
    }
  }

  async get_graphql_video_url(videoId: string) {
    try {
      const video = await this.get_graphql_video_by_id(videoId);

      const preview_url = new URL(video.seekPreviewsURL);
      const domain = preview_url.host;
      const paths = preview_url.pathname.split("/");
      const vod_special_id = paths[paths.findIndex((p) => p.includes("storyboards")) - 1];
      const broadcast_type = video.broadcastType.toLowerCase();
      const channel_login = video.owner.login;

      for (const [resKey] of Object.entries(DEFAULT_RESOLUTIONS)) {
        const url = this.build_playlist_url(
          domain,
          videoId,
          vod_special_id,
          channel_login,
          broadcast_type,
          video.createdAt,
          resKey,
        );

        const codec = await this.check_quality(url);

        if (codec) {
          return url;
        }
      }

      return null;
    } catch (e) {
      throw new Error("Failed to get Twitch video url", { cause: e });
    }
  }

  private async get_graphql_video_by_id(videoId: string) {
    const config = useRuntimeConfig();

    try {
      const response = await $fetch<Twitch["Videos"]["__INTERNAL__"]["GetSingleVideo"]>(
        "https://gql.twitch.tv/gql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Id": config.twitch.playerClientId,
            Accept: "application/json",
          },
          body: {
            query: `query {
              video(id: "${videoId}") {
                broadcastType
                createdAt
                seekPreviewsURL
                owner { login }
              }
            }`,
          },
        },
      );

      if (!response.data?.video) {
        throw new Error("Twitch GraphQL API is missing video response");
      }

      return response.data.video;
    } catch (e) {
      throw new Error("Failed to get Twitch video from GraphQL API", { cause: e });
    }
  }

  private build_playlist_url(
    domain: string,
    vod_id: string,
    vod_special_id: string | undefined,
    channel_login: string,
    broadcast_type: string,
    createdAt: string,
    res_key: string,
  ) {
    if (broadcast_type === "highlight") {
      return `https://${domain}/${vod_special_id}/${res_key}/highlight-${vod_id}.m3u8`;
    }

    if (broadcast_type === "upload" && isAfter(new Date(), createdAt)) {
      return `https://${domain}/${channel_login}/${vod_id}/${vod_special_id}/${res_key}/index-dvr.m3u8`;
    }

    return `https://${domain}/${vod_special_id}/${res_key}/index-dvr.m3u8`;
  }

  private async check_quality(url: string) {
    const resp = await fetch(url);
    if (!resp.ok) return null;

    const text = await resp.text();

    if (text.includes(".ts")) {
      return "avc1.4D001E";
    }

    if (text.includes(".mp4")) {
      const initResp = await fetch(url.replace("index-dvr.m3u8", "init-0.mp4"));
      if (initResp.ok) {
        const content = await initResp.text();
        return content.includes("hev1") ? "hev1.1.6.L93.B0" : "avc1.4D001E";
      }

      return "hev1.1.6.L93.B0";
    }

    return null;
  }
}
