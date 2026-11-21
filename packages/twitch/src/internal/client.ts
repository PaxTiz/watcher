import { add, isBefore } from "date-fns";

import { EventsubService } from "../eventsub";
import { FollowersService } from "../followers";
import { StreamsService } from "../streams";
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

export type RateLimit = { limit: number; remaining: number; reset_at: Date };

export class TwitchClient {
  public readonly settings: ClientSettings;

  public rate_limit: RateLimit | null = null;

  private lowest_remaining: number | null = null;

  private app_token: Promise<{ access_token: string; expires_at: Date }> | null = null;

  public eventsub: EventsubService;
  public followers: FollowersService;
  public streams: StreamsService;
  public users: UsersService;
  public videos: VideosService;

  constructor(options: ClientSettings) {
    this.settings = options;
    this.eventsub = new EventsubService(this);
    this.followers = new FollowersService(this);
    this.streams = new StreamsService(this);
    this.users = new UsersService(this);
    this.videos = new VideosService(this);
  }

  async get_app_token() {
    const current = await this.app_token?.catch(() => null);
    if (current && isBefore(add(new Date(), { minutes: 5 }), current.expires_at)) {
      return current.access_token;
    }

    this.app_token = oauth.get_app_access_token(this.settings).then((response) => ({
      access_token: response.access_token,
      expires_at: add(new Date(), { seconds: response.expires_in }),
    }));

    return (await this.app_token).access_token;
  }

  forget_app_token() {
    this.app_token = null;
  }

  record_rate_limit(headers: Headers) {
    const limit = Number(headers.get("ratelimit-limit"));
    const remaining = Number(headers.get("ratelimit-remaining"));
    const reset = Number(headers.get("ratelimit-reset"));

    if (headers.has("ratelimit-remaining") && Number.isFinite(remaining)) {
      this.rate_limit = { limit, remaining, reset_at: new Date(reset * 1000) };
      this.lowest_remaining = Math.min(this.lowest_remaining ?? remaining, remaining);
    }
  }

  take_lowest_remaining() {
    const lowest = this.lowest_remaining;
    this.lowest_remaining = null;

    return lowest;
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
