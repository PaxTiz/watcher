import { GoogleClient } from "../internal/client";
import { GoogleService } from "../internal/service";
import { YoutubeFeedsService } from "./feeds";
import { YoutubePlaylistItemsService } from "./playlist_items";
import { YoutubeSubscriptionsService } from "./subscriptions";
import { YoutubeVideosService } from "./videos";

export class YoutubeService extends GoogleService {
  public feeds: YoutubeFeedsService;
  public playlist_items: YoutubePlaylistItemsService;
  public subscriptions: YoutubeSubscriptionsService;
  public videos: YoutubeVideosService;

  constructor(client: GoogleClient) {
    super(client);

    this.feeds = new YoutubeFeedsService(client);
    this.playlist_items = new YoutubePlaylistItemsService(client);
    this.subscriptions = new YoutubeSubscriptionsService(client);
    this.videos = new YoutubeVideosService(client);
  }
}
