import GoogleOAuthService from "./oauth";
import GoogleYoutubeSubscriptionsService from "./youtube_subscriptions";

export const google = {
  oauth: new GoogleOAuthService(),

  youtube: {
    subscriptions: new GoogleYoutubeSubscriptionsService(),
  },
};
