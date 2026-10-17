import { useVideos } from "./useVideos";

export const useVideosFavorites = () => {
  return useVideos(
    {
      page: 1,
      per_page: 12,
      is_favorite: true,
    },
    { key: "home_videos_favorites" },
  );
};
