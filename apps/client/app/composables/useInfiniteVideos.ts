import type { VideoResource } from "#shared/resources/videos";

import { useVideos } from "./videos/useVideos";

export const useInfiniteVideos = (
  filters?: { per_page: number },
  options?: {
    key: string;
    loadMoreTrigger: MaybeRefOrGetter<HTMLElement | null>;
  },
) => {
  const page = ref(1);
  const items = ref<VideoResource[]>([]);
  const hasMore = ref(true);
  const total = ref(0);

  const query = computed(() => {
    const f = unref(filters);
    return {
      ...f,
      page: page.value,
      per_page: f?.per_page ?? 30,
    };
  });

  const response = useVideos(query, {
    ...options,
    watch: false,
  });
  const { data, status, refresh } = response;

  const syncItems = (newData: Paginated<VideoResource>) => {
    if (!newData) return;

    if (page.value === 1) {
      items.value = newData.items;
    } else {
      items.value.push(...newData.items);
    }

    total.value = newData.total;
    hasMore.value = items.value.length < newData.total;
  };

  const loadMore = async () => {
    if (status.value === "pending" || !hasMore.value) {
      return;
    }

    page.value++;
    await refresh();
  };

  if (options?.loadMoreTrigger) {
    const { stop } = useIntersectionObserver(
      options.loadMoreTrigger,
      async ([entry]) => {
        if (entry?.isIntersecting && hasMore.value && status.value !== "pending") {
          await loadMore();
        }
      },
      { rootMargin: "250px" },
    );

    onUnmounted(() => {
      stop();
    });
  }

  if (
    isRef(filters) ||
    typeof filters === "function" ||
    (filters && Object.keys(filters).length > 0)
  ) {
    watchDeep(
      () => unref(filters),
      async () => {
        page.value = 1;
        await refresh();
      },
    );
  }

  watchImmediate(data, (d) => {
    if (!d) {
      return;
    }

    syncItems(d);
  });

  return {
    items,
    hasMore,
    status,
    loadMore,
    total,
    refresh,
  };
};
