import type { ServiceCredentials } from "#shared/types/credentials";
import { formatISO } from "date-fns";
import { Twitch, generateState } from "arctic";

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

    return {
      service: "twitch",
      access_token: response.accessToken(),
      refresh_token: response.refreshToken(),
      expires_at: formatISO(response.accessTokenExpiresAt()),
    };
  }

  async refresh_access_token(token: string): Promise<ServiceCredentials> {
    const response = await this.client.refreshAccessToken(token);

    return {
      service: "twitch",
      access_token: response.accessToken(),
      refresh_token: response.refreshToken(),
      expires_at: formatISO(response.accessTokenExpiresAt()),
    };
  }
}
