export const useGlobalSearch = () => {
  const route = useRoute();

  const is_videos_page = computed(() => (route.name as string) === pages.videos_index);
  const search = ref(is_videos_page.value ? ((route.query.query as string) ?? "") : "");

  watch(
    () => route.query.query,
    (query) => {
      if (is_videos_page.value) {
        search.value = (query as string) ?? "";
      }
    },
  );

  const go_to_results = async () => {
    const query = search.value.trim() || undefined;

    await navigateTo(
      {
        path: "/videos",
        query: is_videos_page.value ? { ...route.query, page: 1, query } : { query },
      },
      { replace: is_videos_page.value },
    );
  };

  const on_input = useDebounceFn(async () => {
    if (is_videos_page.value) {
      await go_to_results();
    }
  }, 300);

  const clear_search = async () => {
    search.value = "";
    if (is_videos_page.value) {
      await go_to_results();
    }
  };

  return { search, go_to_results, on_input, clear_search };
};
