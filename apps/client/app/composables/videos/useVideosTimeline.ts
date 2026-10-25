const KEY = "home_videos_timeline";

export const useVideosTimeline = () => {
  const loadMoreTrigger = ref<HTMLElement | null>(null);

  const {
    items: videos,
    hasMore,
    status,
    refresh,
  } = useInfiniteVideos(
    { per_page: 30 },
    {
      key: KEY,
      loadMoreTrigger,
    },
  );

  return {
    videos,
    hasMore,
    status,
    refresh,
    loadMoreTrigger,
  };
};

export const useResetVideosTimeline = () => useResetInfiniteVideos(KEY);
