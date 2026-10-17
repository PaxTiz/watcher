import type { Paginated, VideoResource } from "@watcher/common";
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
