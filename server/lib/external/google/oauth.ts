import type { ServiceCredentials } from "#shared/types/credentials";
import { formatISO } from "date-fns";
import { Google, generateState, generateCodeVerifier } from "arctic";

const verifiers: Record<string, string> = {};

export default class GoogleOAuthService {
  private client: Google;

  constructor() {
    const config = useRuntimeConfig();
    this.client = new Google(
      config.google.clientId,
      config.google.clientSecret,
      "http://localhost:3000/api/oauth/google/callback",
    );
  }

  async get_authorization_url() {
    const state = generateState();
    verifiers[state] = generateCodeVerifier();

    const url = this.client.createAuthorizationURL(state, verifiers[state], [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
    ]);

    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    return url.toString();
  }

  async get_tokens(state: string, code: string): Promise<ServiceCredentials> {
    const verifier = verifiers[state];
    if (!verifier) {
      throw new Error("Invalid authentication flow for Google: code verifier not found");
    }

    const response = await this.client.validateAuthorizationCode(code, verifier);
    const user = await this.get_user(response.accessToken());

    delete verifiers[state];

    return {
      service: "google",
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
      service: "google",
      userId: user.userId,
      access_token: response.accessToken(),
      refresh_token: token,
      expires_at: formatISO(response.accessTokenExpiresAt()),
    };
  }

  private async get_user(token: string): Promise<{ userId: string }> {
    try {
      const response = await $fetch<{ id: string }>(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      );

      return { userId: response.id };
    } catch (e) {
      throw new Error("Could not fetch Google user", { cause: e });
    }
  }
}
