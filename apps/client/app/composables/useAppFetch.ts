import type { FetchError } from "ofetch";

import type {
  AnyServerRouteMethod,
  NuxtError,
  TypedFetchOptions,
  TypedFetchRequest,
  TypedServerResponse,
} from "#app";

export type ApiError = { status: number; message?: string };

type ResponseError = { statusCode?: number };

// Business-rule errors (`UnprocessableEntityError`) are meant to be displayed by the caller
const NON_FATAL_STATUS_CODES = [422];

const toFatalError = (error: MaybeRef<ResponseError | null | undefined>): NuxtError | undefined => {
  const e = unref(error);
  if (!e || (e.statusCode && NON_FATAL_STATUS_CODES.includes(e.statusCode))) {
    return;
  }

  return createError({ statusCode: e.statusCode, fatal: true });
};

// Shows the error page when a read fails, unless `fatal: false` is passed. Awaiting the
// `useAppFetch` call also rejects, so a failing request stops the page setup (SSR included).
const fatalErrors = defineUseFetchAddon<{ fatal?: false }>({
  setup: (options) => (asyncData) => {
    if (options.fatal === false) {
      return;
    }

    const error = asyncData.error as Ref<NuxtError | undefined>;

    if (import.meta.client) {
      const nuxtApp = useNuxtApp();
      watch(
        error,
        (e) => {
          const fatalError = toFatalError(e);
          if (fatalError) {
            void nuxtApp.runWithContext(() => showError(fatalError));
          }
        },
        { immediate: true },
      );
    }

    return {
      // oxlint-disable-next-line unicorn/no-thenable
      then: (
        next: Promise<unknown>["then"],
        onFulfilled?: (value: any) => any,
        onRejected?: (reason: any) => any,
      ) =>
        next((result) => {
          const fatalError = toFatalError(error);
          if (!fatalError) {
            return onFulfilled ? onFulfilled(result) : result;
          }

          if (onRejected) {
            return onRejected(fatalError);
          }

          throw fatalError;
        }, onRejected),
    };
  },
});

export const useAppFetch = createUseFetch({
  addons: [fatalErrors],
});

export const callApi = async <
  R extends TypedFetchRequest,
  const M extends AnyServerRouteMethod = "get",
>(
  request: R,
  options?: TypedFetchOptions<R, M, ""> & { form?: string },
): Promise<
  | { data: TypedServerResponse<R, unknown, M>; error: undefined }
  | { data: undefined; error: ApiError }
> => {
  const request_fetch = useRequestFetch();
  const { form, ...fetchOptions } = options ?? {};

  if (form) {
    setFormError(form, undefined);
  }

  try {
    const data = (await request_fetch(
      request as string,
      fetchOptions as object,
    )) as TypedServerResponse<R, unknown, M>;
    return { data, error: undefined };
  } catch (error) {
    const fetchError = error as FetchError<{ message?: string }>;

    const apiError: ApiError = {
      status: fetchError.statusCode ?? 500,
      message: fetchError.data?.message,
    };

    if (form) {
      setFormError(form, apiError);
    }

    return { data: undefined, error: apiError };
  }
};
