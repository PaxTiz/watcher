import TwitchFollowersService from "./followers";
import TwitchOAuthService from "./oauth";
import TwitchUsersService from "./users";
import TwitchVideosService from "./videos";

export const twitch = {
  oauth: new TwitchOAuthService(),

  followers: new TwitchFollowersService(),

  videos: new TwitchVideosService(),

  users: new TwitchUsersService(),
};
