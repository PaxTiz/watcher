import TwitchFollowersService from "./followers";
import TwitchOAuthService from "./oauth";
import TwitchUsersService from "./users";

export const twitch = {
  oauth: new TwitchOAuthService(),

  followers: new TwitchFollowersService(),

  users: new TwitchUsersService(),
};
