import type { SearchResource, SubscriptionType } from "@watcher/common";
import { search } from "@watcher/database";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { extract_guests, guest_key } from "#server/utils/guests";
import type { SearchValidators } from "#shared/validators/search";

const MAX_CHANNELS = 5;
const MAX_VIDEOS = 20;
const MAX_GUESTS = 15;

export default class SearchService extends AbstractService {
  async search(user: User, params: SearchValidators["search"]["query"]): Promise<SearchResource> {
    const query = params.query?.trim() || undefined;
    const filters = { duration: params.duration, guests: params.guests };

    const with_channels = params.type !== "videos" && !!query;
    const with_videos = params.type !== "channels" && (!!query || !!params.guests?.length);

    const [channels, videos, guests] = await Promise.all([
      with_channels
        ? search.find_channels({ user_id: user.id, query: query!, limit: MAX_CHANNELS })
        : [],
      with_videos
        ? search.find_videos({
            user_id: user.id,
            query,
            filters,
            sort: params.sort,
            limit: MAX_VIDEOS,
          })
        : [],
      with_videos
        ? search.find_guests({ user_id: user.id, query, filters, limit: MAX_GUESTS })
        : [],
    ]);

    return {
      channels: channels.map((channel) => services.subscriptions.to_resource(channel)),
      videos: videos.map((video) => services.videos.to_list_resource(video)),
      guests,
    };
  }

  async index_guests({
    service,
    channel_name,
    videos,
  }: {
    service: SubscriptionType;
    channel_name: string;
    videos: Array<{ service_id: string; title: string }>;
  }) {
    const known = await search.find_known_people();
    const known_keys = new Set([...known.channel_names.map(guest_key), ...known.guest_keys]);

    const no_known_keys = new Set<string>();
    for (const video of videos) {
      for (const guest of extract_guests(video.title, {
        known_keys: no_known_keys,
        channel_name,
      })) {
        known_keys.add(guest.key);
      }
    }

    const with_guests = videos.map((video) => ({
      service_id: video.service_id,
      guests: extract_guests(video.title, { known_keys, channel_name }),
    }));

    await search.replace_guests({ service, videos: with_guests });

    useLogger("services.search").debug(
      {
        service,
        channel: channel_name,
        videos: videos.length,
        guests: with_guests.reduce((total, video) => total + video.guests.length, 0),
      },
      "Videos guests indexed",
    );
  }
}
