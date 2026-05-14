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
  public followers: FollowersService;
  public users: UsersService;
  public videos: VideosService;

  constructor(options: ClientSettings) {
    this.followers = new FollowersService(options);
    this.users = new UsersService(options);
    this.videos = new VideosService(options);
  }
}
