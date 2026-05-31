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
  return useAsyncData(
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

        onRequestError(response) {
          if (!response.error) {
            return;
          }

          if (response.response?.status === 422 && options?.to) {
            const { setError } = useFormErrors(options.to);
            setError(response.error.message);

            return;
          }

          throw createError({ statusCode: response.response?.status, fatal: true });
        },
      }),
    asyncDataOptions,
  );
}
