import type { VideosValidators } from "#shared/validators/videos";

export type VideoFilters = Omit<VideosValidators["list"]["query"], "page" | "per_page">;
export type VideoFilterType =
  | "service"
  | "duration"
  | "date"
  | "subscription_id"
  | "is_favorite"
  | "query";
export type VideoFilterEmit = {
  type: VideoFilterType;
  value: VideosValidators["list"]["query"][VideoFilterType];
};

export const useVideosFilters = (base?: VideoFilters) => {
  const filters = ref<Pick<VideosValidators["list"]["query"], VideoFilterType>>({
    service: base?.service,
    duration: base?.duration,
    date: base?.date,
    subscription_id: base?.subscription_id,
    is_favorite: base?.is_favorite,
    query: base?.query,
  });

  return {
    filters,
  };
};
