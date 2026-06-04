import type { AsyncDataOptions, UseFetchOptions } from "nuxt/app";
import { type FetchOptions, $fetch } from "ofetch";

export function useAppFetch<T>(url: string | (() => string), options?: UseFetchOptions<T>) {
  const response = useFetch(url, options);

  watch(
    response.error,
    (error) => {
      if (!error) {
        return;
      }

      throw createError({ statusCode: error.statusCode, fatal: true });
    },
    { immediate: true, deep: true },
  );

  return response;
}

export function usePost<T>(
  url: string,
  options?: { key?: string; to?: string } & FetchOptions<"json", T>,
  asyncDataOptions: AsyncDataOptions<T> = { immediate: false },
) {
  const response = useAsyncData(
    options?.key ?? url,
    () =>
      $fetch(url, {
        ...options,

        onRequest() {
          if (options?.to) {
            const { setError } = useFormErrors(options.to);
            setError(null);
          }
        },
      }),
    asyncDataOptions,
  );

  watchDeep(response.error, (error) => {
    if (!error) {
      return;
    }

    if (error.status === 422 && options?.to) {
      const { setError } = useFormErrors(options.to);
      setError(error.message);
    }

    throw createError({ statusCode: error.status, fatal: true });
  });

  return response;
}
