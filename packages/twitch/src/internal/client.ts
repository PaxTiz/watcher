import { FollowersService } from "../followers";
import { UsersService } from "../users";
import { VideosService } from "../videos";

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

export class TwitchClient {
  public readonly settings: ClientSettings;

  public followers: FollowersService;
  public users: UsersService;
  public videos: VideosService;

  constructor(options: ClientSettings) {
    this.settings = options;
    this.followers = new FollowersService(this);
    this.users = new UsersService(this);
    this.videos = new VideosService(this);
  }
}
