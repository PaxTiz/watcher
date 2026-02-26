import GoogleOAuthService from "./oauth";
import GoogleYoutubeSubscriptionsService from "./youtube_subscriptions";
import GoogleYoutubeVideosService from "./youtube_videos";

export const google = {
  oauth: new GoogleOAuthService(),

  youtube: {
    subscriptions: new GoogleYoutubeSubscriptionsService(),
    videos: new GoogleYoutubeVideosService(),
  },
};
