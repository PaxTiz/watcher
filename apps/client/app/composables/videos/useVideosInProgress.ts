import { useVideosPage } from "./useVideos";

export const useVideosInProgress = () => {
  return useVideosPage(
    {
      page: 1,
      per_page: 12,
      with_total: false,
      in_progress: true,
    },
    { key: "home_videos_in_progress", lazy: true },
  );
};
