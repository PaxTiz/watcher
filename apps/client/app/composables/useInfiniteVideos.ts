import type { Paginated, VideoResource } from "@watcher/common";

import { useVideos } from "./videos/useVideos";

export const useInfiniteVideos = (
  filters?: { per_page: number },
  options?: {
    key: string;
    loadMoreTrigger: MaybeRefOrGetter<HTMLElement | null>;
  },
) => {
  const before = ref<string | undefined>();
  const items = ref<VideoResource[]>([]);
  const hasMore = ref(true);
  const total = ref(0);

  const query = computed(() => {
    const f = unref(filters);
    return {
      ...f,
      page: 1,
      per_page: f?.per_page ?? 30,
      before: before.value,
    };
  });

  const response = useVideos(query, {
    ...options,
    watch: false,
  });
  const { data, status, refresh } = response;

  const syncItems = (newData: Paginated<VideoResource>) => {
    if (!newData) return;

    if (!before.value) {
      items.value = newData.items;
    } else {
      items.value.push(...newData.items);
    }

    total.value = newData.total;
    hasMore.value = newData.items.length === query.value.per_page;
  };

  const loadMore = async () => {
    if (status.value === "pending" || !hasMore.value) {
      return;
    }

    before.value = items.value.at(-1)?.id;
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
        before.value = undefined;
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
