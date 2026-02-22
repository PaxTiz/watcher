import type { ServiceCredentials } from "#shared/types/credentials";
import { formatISO } from "date-fns";
import { Twitch, generateState, decodeIdToken } from "arctic";

export default class TwitchOAuthService {
  private client: Twitch;

  constructor() {
    const config = useRuntimeConfig();
    this.client = new Twitch(
      config.twitch.clientId,
      config.twitch.clientSecret,
      "http://localhost:3000/api/oauth/twitch/callback",
    );
  }

  async get_authorization_url() {
    const state = generateState();

    return this.client
      .createAuthorizationURL(state, [
        "user:read:email",
        "user:read:follows",
        "user:read:subscriptions",
      ])
      .toString();
  }

  async get_tokens(code: string): Promise<ServiceCredentials> {
    const response = await this.client.validateAuthorizationCode(code);
    const user = await this.get_user(response.accessToken());

    return {
      service: "twitch",
      userId: user.userId,
      access_token: response.accessToken(),
      refresh_token: response.refreshToken(),
      expires_at: formatISO(response.accessTokenExpiresAt()),
    };
  }

  async refresh_access_token(token: string): Promise<ServiceCredentials> {
    const response = await this.client.refreshAccessToken(token);
    const user = await this.get_user(response.accessToken());

    return {
      service: "twitch",
      userId: user.userId,
      access_token: response.accessToken(),
      refresh_token: response.refreshToken(),
      expires_at: formatISO(response.accessTokenExpiresAt()),
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
