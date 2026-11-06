import type { Page, Paginated, VideoResource } from "@watcher/common";
import type { UseFetchOptions } from "nuxt/app";

import type { VideosValidators } from "#shared/validators/videos";

type Filters = VideosValidators["list"]["query"];

export const useVideos = (
  filters?: Filters | Ref<Filters> | ComputedRef<Filters>,
  options?: UseFetchOptions<Paginated<VideoResource>>,
) => {
  return useAppFetch<Paginated<VideoResource>>("/api/videos", {
    ...options,
    query: filters,
  });
};

export const useVideosPage = (
  filters?: Filters | Ref<Filters> | ComputedRef<Filters>,
  options?: UseFetchOptions<Page<VideoResource>>,
) => {
  return useAppFetch<Page<VideoResource>>("/api/videos", {
    ...options,
    query: filters,
  });
};
