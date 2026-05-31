import type { VideoResource } from "#shared/resources/videos";
import type { VideosValidators } from "#shared/validators/videos";

type Filters = VideosValidators["list"]["query"];

export const useVideos = (
  filters?: Filters | Ref<Filters> | ComputedRef<Filters>,
  options?: { key: string },
) => {
  return useAppFetch<Paginated<VideoResource>>("/api/videos", {
    key: options?.key,
    query: filters,
  });
};
