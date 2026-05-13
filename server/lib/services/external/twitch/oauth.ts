import { Twitch } from "arctic";

import { AbstractService } from "#framework";
import type { ServiceCredentials } from "#shared/types/credentials";

export default class TwitchOAuthService extends AbstractService {
  private client: Twitch;

  constructor() {
    super();

    const config = useRuntimeConfig();
    this.client = new Twitch(
      config.oauth.twitch.clientId,
      config.oauth.twitch.clientSecret,
      "http://localhost:3000/api/oauth/twitch/callback",
    );
  }

  async refresh_access_token(token: string): Promise<ServiceCredentials> {
    const response = await this.client.refreshAccessToken(token);
    const user = await this.get_user(response.accessToken());

    return {
      service: "twitch",
      service_id: user.userId,
      userId: user.userId,
      access_token: response.accessToken(),
      refresh_token: response.refreshToken(),
      access_token_expires_at: response.accessTokenExpiresAt(),
      refresh_token_expires_at: response.accessTokenExpiresAt(),
    };
  }

  private async get_user(token: string): Promise<{ userId: string }> {
    try {
      const response = await $fetch<{ sub: string }>("https://id.twitch.tv/oauth2/userinfo", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return { userId: response.sub };
    } catch (e) {
      throw new Error("Could not fetch Twitch user", { cause: e });
    }
  }
}
