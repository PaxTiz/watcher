import type { Page, Paginated, VideoListResource } from "@watcher/common";
import type { UseFetchOptions } from "nuxt/app";

import type { VideosValidators } from "#shared/validators/videos";

type Filters = VideosValidators["list"]["query"];

export const useVideos = (
  filters?: Filters | Ref<Filters> | ComputedRef<Filters>,
  options?: UseFetchOptions<Paginated<VideoListResource>>,
) => {
  return useAppFetch<Paginated<VideoListResource>>("/api/videos", {
    ...options,
    query: filters,
  });
};

export const useVideosPage = (
  filters?: Filters | Ref<Filters> | ComputedRef<Filters>,
  options?: UseFetchOptions<Page<VideoListResource>>,
) => {
  return useAppFetch<Page<VideoListResource>>("/api/videos", {
    ...options,
    query: filters,
  });
};
