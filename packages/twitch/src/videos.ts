import { isAfter } from "date-fns";
import { ofetch } from "ofetch";

import type { Twitch } from "../types";
import { type ClientSettings } from "./internal/client";
import { type TwitchServiceRequest, TwitchService } from "./internal/service";

const DEFAULT_RESOLUTIONS = {
  chunked: { name: "Source", resolution: "chunked", frameRate: 60 },
  "1440p60": { name: "1440p60", resolution: "2560x1440", frameRate: 60 },
  "1080p60": { name: "1080p60", resolution: "1920x1080", frameRate: 60 },
  "720p60": { name: "720p60", resolution: "1280x720", frameRate: 60 },
  "480p30": { name: "480p", resolution: "854x480", frameRate: 30 },
  "360p30": { name: "360p", resolution: "640x360", frameRate: 30 },
  "160p30": { name: "160p", resolution: "284x160", frameRate: 30 },
};

export class VideosService extends TwitchService {
  constructor(settings: ClientSettings) {
    super(settings);
  }

  public async list(
    data: { user_id: string; cursor?: string },
    config: TwitchServiceRequest,
  ): Promise<Twitch["Videos"]["List"]> {
    return await this.perform_request(config.service_id, async (token) => {
      const url = new URL("https://api.twitch.tv/helix/videos");
      url.searchParams.set("first", "100");
      url.searchParams.set("archive", "archive");
      url.searchParams.set("sort", "time");
      url.searchParams.set("period", "all");
      url.searchParams.set("user_id", data.user_id);

      if (data.cursor) {
        url.searchParams.set("after", data.cursor);
      }

      return await ofetch<Twitch["Videos"]["List"]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": this.settings.client_id,
        },
      });
    });
  }

  public async get_master_playlist(video_id: string, player_client_id: string) {
    try {
      const video = await this.get_graphql_video_by_id(video_id, player_client_id);

      const preview_url = new URL(video.seekPreviewsURL);
      const domain = preview_url.host;
      const paths = preview_url.pathname.split("/");
      const vod_special_id = paths[paths.findIndex((p) => p.includes("storyboards")) - 1];
      const broadcast_type = video.broadcastType.toLowerCase();
      const channel_login = video.owner.login;

      const available_levels: Array<{ key: string; url: string; codec: string }> = [];

      for (const [resKey] of Object.entries(DEFAULT_RESOLUTIONS)) {
        const url = this.build_playlist_url(
          domain,
          video_id,
          vod_special_id,
          channel_login,
          broadcast_type,
          video.createdAt,
          resKey,
        );

        const codec = await this.check_quality(url);
        if (codec) {
          available_levels.push({ key: resKey, url, codec });
        }
      }

      if (available_levels.length === 0) return null;

      return this.build_master_playlist(available_levels);
    } catch (e) {
      throw new Error("Failed to get Twitch video url", { cause: e });
    }
  }

  private async get_graphql_video_by_id(video_id: string, player_client_id: string) {
    try {
      const response = await ofetch<Twitch["Videos"]["__INTERNAL__"]["GetSingleVideo"]>(
        "https://gql.twitch.tv/gql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Id": player_client_id,
            Accept: "application/json",
          },
          body: {
            query: `query {
              video(id: "${video_id}") {
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

  private build_master_playlist(levels: Array<{ key: string; url: string; codec: string }>) {
    const lines = ["#EXTM3U"];

    for (const { key, url, codec } of levels) {
      const meta = DEFAULT_RESOLUTIONS[key as keyof typeof DEFAULT_RESOLUTIONS];
      const bandwidth = this.get_bandwidth(key);
      const resolution = meta.resolution !== "chunked" ? `RESOLUTION=${meta.resolution},` : "";

      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},${resolution}FRAME-RATE=${meta.frameRate},CODECS="${codec}"`,
        url,
      );
    }

    return lines.join("\n");
  }

  private get_bandwidth(resKey: string): number {
    const bandwidths: Record<string, number> = {
      chunked: 8_000_000,
      "1440p60": 6_000_000,
      "1080p60": 4_500_000,
      "720p60": 3_000_000,
      "480p30": 1_500_000,
      "360p30": 800_000,
      "160p30": 300_000,
    };

    return bandwidths[resKey] ?? 1_000_000;
  }
}
