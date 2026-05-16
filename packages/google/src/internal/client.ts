import { YoutubeService } from "../youtube";

export type ClientTokens = {
  access_token: string;

  access_token_expires_at: Date;

  refresh_token: string;

  refresh_token_expires_at: Date;
};

export type ClientSettings = {
  client_id: string;

  client_secret: string;

  onRequest: (service_id: string) => Promise<ClientTokens | null>;

  onRefreshToken: (params: { service_id: string; tokens: ClientTokens }) => Promise<ClientTokens>;
};

export class GoogleClient {
  public readonly settings: ClientSettings;

  public youtube: YoutubeService;

  constructor(options: ClientSettings) {
    this.settings = options;
    this.youtube = new YoutubeService(this);
  }
}
