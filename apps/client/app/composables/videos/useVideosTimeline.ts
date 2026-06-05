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
      key: "home_videos_timeline",
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
