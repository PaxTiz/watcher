
      import { default as credentials } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/credentials';
import { default as subscriptions } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/subscriptions';
import { default as videos } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/videos';
import { default as sync_twitch } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/sync/twitch';
import { default as sync_youtube } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/sync/youtube';
import { default as external_twitch_followers } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/twitch/followers';
import { default as external_twitch_oauth } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/twitch/oauth';
import { default as external_twitch_users } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/twitch/users';
import { default as external_twitch_videos } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/twitch/videos';
import { default as external_google_oauth } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/google/oauth';
import { default as external_google_youtube_subscriptions } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/google/youtube_subscriptions';
import { default as external_google_youtube_videos } from '/Users/vcernuta/Local/Node/watcher/server/lib/services/external/google/youtube_videos';

      export const services = {
        credentials: new credentials(), 
subscriptions: new subscriptions(), 
videos: new videos(), 
sync: {
          twitch: new sync_twitch(), 
youtube: new sync_youtube()
        }, 
external: {
          twitch: {
          followers: new external_twitch_followers(), 
oauth: new external_twitch_oauth(), 
users: new external_twitch_users(), 
videos: new external_twitch_videos()
        }, 
google: {
          oauth: new external_google_oauth(), 
youtubeSubscriptions: new external_google_youtube_subscriptions(), 
youtubeVideos: new external_google_youtube_videos()
        }
        }
      };
    