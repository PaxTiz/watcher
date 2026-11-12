import type { SearchResource, SubscriptionType } from "@watcher/common";
import { search } from "@watcher/database";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";
import { services } from "#framework/server";
import { build_known_people, extract_channel_guests, keys_in_query } from "#server/utils/guests";
import { public_image_url } from "#server/utils/images";
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
        ? search.find_guests({
            user_id: user.id,
            query,
            filters,
            excluded_keys: query ? keys_in_query(query) : [],
            limit: MAX_GUESTS,
          })
        : [],
    ]);

    return {
      channels: channels.map((channel) => services.subscriptions.to_resource(channel)),
      videos: videos.map((video) => services.videos.to_list_resource(video)),
      guests: guests.map((guest) => ({
        ...guest,
        logo: guest.logo ? public_image_url(guest.logo) : null,
      })),
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
    const titles = videos.map((video) => video.title);

    const known_keys = new Set(known.guests.map((guest) => guest.key));
    const batch_guests = new Map<string, { key: string; name: string; videos_count: number }>();
    const first_pass = extract_channel_guests(titles, {
      people: build_known_people(known),
      channel_name,
    });
    for (const guest of first_pass.flat()) {
      if (!known_keys.has(guest.key)) {
        const id = `${guest.key}\n${guest.name}`;
        const entry = batch_guests.get(id) ?? { key: guest.key, name: guest.name, videos_count: 0 };
        batch_guests.set(id, { ...entry, videos_count: entry.videos_count + 1 });
      }
    }

    const people = build_known_people({
      channels: known.channels,
      guests: [...known.guests, ...batch_guests.values()],
    });
    const with_guests = extract_channel_guests(titles, { people, channel_name }).map(
      (guests, index) => ({ service_id: videos[index]!.service_id, guests }),
    );

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
