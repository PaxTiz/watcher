import { google, Auth } from "googleapis";
import type { ServiceCredentials } from "#shared/types/credentials";
import { fromUnixTime, formatISO } from "date-fns";

export default class GoogleOAuthService {
  private client: Auth.OAuth2Client;

  constructor() {
    const config = useRuntimeConfig();
    this.client = new google.auth.OAuth2({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      redirectUri: "http://localhost:3000/api/oauth/google/callback",
    });
  }

  async get_authorization_url() {
    return this.client.generateAuthUrl({
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      access_type: "offline",
      prompt: "consent",
    });
  }

  async get_tokens(code: string): Promise<ServiceCredentials> {
    const response = await this.client.getToken({ code });

    return {
      service: "google",
      access_token: response.tokens.access_token!,
      refresh_token: response.tokens.refresh_token!,
      expires_at: formatISO(fromUnixTime(response.tokens.expiry_date!)),
    };
  }

  async refresh_access_token(token: string): Promise<ServiceCredentials> {
    this.client.setCredentials({ refresh_token: token });
    const response = await this.client.refreshAccessToken();

    return {
      service: "google",
      access_token: response.credentials.access_token!,
      refresh_token: response.credentials.refresh_token!,
      expires_at: formatISO(fromUnixTime(response.credentials.expiry_date!)),
    };
  }
}
