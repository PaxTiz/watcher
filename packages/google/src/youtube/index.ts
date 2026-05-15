import type { ClientSettings } from "../../../twitch/src/internal/client";
import { GoogleService } from "../internal/service";
import { YoutubeChannelsService } from "./channels";
import { YoutubePlaylistItemsService } from "./playlist_items";
import { YoutubeSubscriptionsService } from "./subscriptions";
import { YoutubeVideosService } from "./videos";

export class YoutubeService extends GoogleService {
  public channels: YoutubeChannelsService;
  public playlist_items: YoutubePlaylistItemsService;
  public subscriptions: YoutubeSubscriptionsService;
  public videos: YoutubeVideosService;

  constructor(options: ClientSettings) {
    super(options);

    this.channels = new YoutubeChannelsService(options);
    this.playlist_items = new YoutubePlaylistItemsService(options);
    this.subscriptions = new YoutubeSubscriptionsService(options);
    this.videos = new YoutubeVideosService(options);
  }
}
