import type { Twitch } from "#shared/types/twitch";

export default class TwitchVideosService {
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
}
