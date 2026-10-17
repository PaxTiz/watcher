import { useVideos } from "./useVideos";

export const useVideosInProgress = () => {
  return useVideos(
    {
      page: 1,
      per_page: 12,
      in_progress: true,
    },
    { key: "home_videos_in_progress" },
  );
};
