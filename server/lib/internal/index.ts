import CredentialsService from "./credentials";
import SubscriptionsService from "./subscriptions";
import VideosService from "./videos";

export const internal = {
  credentials: new CredentialsService(),
  subscriptions: new SubscriptionsService(),
  videos: new VideosService(),
};
