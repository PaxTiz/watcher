import type { UseFetchOptions } from "nuxt/app";

type UseAppFetchOptions<T> = UseFetchOptions<T> & { to?: string };

export function useAppFetch<T>(url: string | (() => string), options?: UseAppFetchOptions<T>) {
  if (options?.to) {
    const { setError } = useFormErrors(options.to);
    setError(null);
  }

  const query = computed(() => ({
    ...unref(options?.query),
  }));

  const response = useFetch(url, {
    ...options,
    query: query.value,
  });

  watch(query, () => {
    response.refresh();
  });

  watch(
    response.error,
    (error) => {
      if (!error) {
        return;
      }

      if (error.statusCode === 422 && options?.to) {
        const { setError } = useFormErrors(options.to);
        setError(error.data.message);

        return;
      }

      if (error.statusCode === 429) {
        return;
      }

      throw createError({ statusCode: error.statusCode, fatal: true });
    },
    { immediate: true, deep: true },
  );

  return response;
}
