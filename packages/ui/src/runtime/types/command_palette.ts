export interface CommandItem<T = unknown> {
  id: string | number;
  label: string;
  keywords?: string[];
  group?: string;
  disabled?: boolean;
  data: T;
}

export interface Video {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration?: number;
  views?: number;
  url?: string;
}

export type DurationFilter = "any" | "short" | "medium" | "long";
export type SortFilter = "relevance" | "recent" | "views";

export interface Channel {
  id: string;
  name: string;
  handle?: string;
  avatar: string;
  subscribers?: number;
  url?: string;
}

export type SearchType = "all" | "videos" | "channels";

export interface SearchFilters {
  type: SearchType;
  duration: DurationFilter;
  sort: SortFilter;
}

export interface SearchResults {
  channels: Channel[];
  videos: Video[];
}

export type SearchResult = { kind: "channel"; channel: Channel } | { kind: "video"; video: Video };
