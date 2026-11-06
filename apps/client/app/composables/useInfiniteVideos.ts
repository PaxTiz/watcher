import type { Page, VideoResource } from "@watcher/common";

import { useVideosPage } from "./videos/useVideos";

export const useInfiniteVideos = (
  filters?: { per_page: number },
  options?: {
    key: string;
    loadMoreTrigger: MaybeRefOrGetter<HTMLElement | null>;
  },
) => {
  const before = options?.key
    ? useState<string | undefined>(`${options.key}:before`, () => undefined)
    : ref<string | undefined>();
  before.value = undefined;
  const items = ref<VideoResource[]>([]);
  const hasMore = ref(true);

  const query = computed(() => {
    const f = unref(filters);
    return {
      ...f,
      page: 1,
      per_page: f?.per_page ?? 30,
      before: before.value,
      with_total: false,
    };
  });

  const response = useVideosPage(query, {
    ...options,
    lazy: true,
    watch: false,
  });
  const { data, status, refresh } = response;

  const syncItems = (newData: Page<VideoResource>) => {
    if (!newData) return;

    if (!before.value) {
      items.value = newData.items;
    } else {
      items.value.push(...newData.items);
    }

    hasMore.value = newData.has_more;
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

  // Watchers don't re-run during SSR, so the first page has to be synced once fetched
  if (import.meta.server) {
    onServerPrefetch(async () => {
      await response;
      if (data.value) {
        syncItems(data.value);
      }
    });
  }

  return {
    items,
    hasMore,
    status,
    loadMore,
    refresh,
  };
};

export const useResetInfiniteVideos = (key: string) => {
  const nuxtApp = useNuxtApp();
  const before = useState<string | undefined>(`${key}:before`, () => undefined);

  return async () => {
    before.value = undefined;
    await nuxtApp.runWithContext(() => refreshNuxtData(key));
  };
};
