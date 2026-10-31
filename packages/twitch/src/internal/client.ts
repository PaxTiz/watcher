import { add, isBefore } from "date-fns";

import { FollowersService } from "../followers";
import { UsersService } from "../users";
import { VideosService } from "../videos";
import { oauth } from "./oauth";

export type ClientTokens = {
  access_token: string;

  access_token_expires_at: Date;

  refresh_token: string;

  refresh_token_expires_at: Date | null;
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

  async revoke(tokens: ClientTokens) {
    let { access_token, refresh_token } = tokens;

    if (isBefore(tokens.access_token_expires_at, add(new Date(), { minutes: 1 }))) {
      ({ access_token, refresh_token } = await oauth.refresh_access_token(
        this.settings,
        refresh_token,
      ));
    }

    const [access] = await Promise.allSettled([
      oauth.revoke_token(this.settings, access_token),
      oauth.revoke_token(this.settings, refresh_token),
    ]);

    if (access.status === "rejected") {
      throw access.reason;
    }
  }
}
