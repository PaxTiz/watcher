import CredentialsService from "./credentials";
import SubscriptionsService from "./subscriptions";

export const internal = {
  credentials: new CredentialsService(),
  subscriptions: new SubscriptionsService(),
};
