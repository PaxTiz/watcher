import type {
  SubscriptionResource,
  VideoListResource,
  VideoMentionResource,
} from "@watcher/common";

import type { VideosValidators } from "#shared/validators/videos";

type VideosQuery = VideosValidators["list"]["query"];

export type SearchType = "all" | "videos" | "channels";

export type SearchFilters = {
  type: SearchType;
  duration: NonNullable<VideosQuery["duration"]> | "any";
  sort: NonNullable<VideosQuery["sort"]>;
  mentions: Array<string>;
};

export type SearchResults = {
  channels: Array<SubscriptionResource>;
  videos: Array<VideoListResource>;
  mentions: Array<VideoMentionResource>; // mentions of the matching videos, to narrow them down
};

export type SearchResult =
  | { kind: "channel"; channel: SubscriptionResource }
  | { kind: "video"; video: VideoListResource };

const MAX_CHANNELS = 5;
const MAX_VIDEOS = 20;
const MAX_MENTIONS = 15;

export const empty_search_results = (): SearchResults => ({
  channels: [],
  videos: [],
  mentions: [],
});

// Channels and videos are fetched in parallel. Without a query (only mentions selected), there's
// nothing to match channels against.
export async function search(
  query: string,
  filters: SearchFilters,
  signal: AbortSignal,
): Promise<SearchResults> {
  const with_channels = filters.type !== "videos" && !!query;
  const with_videos = filters.type !== "channels";

  const videos_filters = {
    query: query || undefined,
    duration: filters.duration === "any" ? undefined : filters.duration,
    mentions: filters.mentions.length ? filters.mentions : undefined,
  };

  const [channels, videos, mentions] = await Promise.all([
    with_channels
      ? $fetch("/api/subscriptions", { query: { query }, signal })
      : Promise.resolve([]),
    with_videos
      ? $fetch("/api/videos", {
          query: {
            ...videos_filters,
            page: 1,
            per_page: MAX_VIDEOS,
            with_total: false,
            sort: filters.sort,
          },
          signal,
        }).then((page) => page.items)
      : Promise.resolve([]),
    with_videos
      ? $fetch("/api/videos/mentions", {
          query: { ...videos_filters, limit: MAX_MENTIONS },
          signal,
        })
      : Promise.resolve([]),
  ]);

  return { channels: channels.slice(0, MAX_CHANNELS), videos, mentions };
}
