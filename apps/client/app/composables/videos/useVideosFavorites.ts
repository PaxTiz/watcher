import { useVideosPage } from "./useVideos";

export const useVideosFavorites = () => {
  return useVideosPage(
    {
      page: 1,
      per_page: 12,
      with_total: false,
      is_favorite: true,
    },
    { key: "home_videos_favorites", lazy: true },
  );
};
