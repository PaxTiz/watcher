import type { UseFetchOptions } from "nuxt/app";

import type { VideoResource } from "#shared/resources/videos";
import { type VideoOnHideType, VIDE_ON_HIDE_SYMBOL } from "#shared/types/videos";
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
