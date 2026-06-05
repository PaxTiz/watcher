import { useVideos } from "./useVideos";

export const useVideosFavorites = () => {
  return useVideos(
    {
      page: 1,
      per_page: 9,
      is_favorite: true,
    },
    { key: "home_videos_favorites" },
  );
};
