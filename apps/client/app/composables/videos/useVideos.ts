import {
  type Paginated,
  type VideoOnHideType,
  type VideoResource,
  VIDE_ON_HIDE_SYMBOL,
} from "@watcher/common";
import type { UseFetchOptions } from "nuxt/app";

import type { VideosValidators } from "#shared/validators/videos";

type Filters = VideosValidators["list"]["query"];

export const useVideos = (
  filters?: Filters | Ref<Filters> | ComputedRef<Filters>,
  options?: UseFetchOptions<Paginated<VideoResource>>,
) => {
  const response = useAppFetch<Paginated<VideoResource>>("/api/videos", {
    ...options,
    query: filters,
  });

  provide<VideoOnHideType>(VIDE_ON_HIDE_SYMBOL, async () => {
    await response.refresh();
  });

  return response;
};
