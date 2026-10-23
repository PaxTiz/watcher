import type { ApiError } from "~/composables/useAppFetch";

export const ERROR_MESSAGES: Record<string, string> = {};

const useFormErrorState = (key: string) => useState<string | null>(key, () => null);

export const setFormError = (key: string, apiError: ApiError | undefined) => {
  const error = useFormErrorState(key);

  if (apiError?.status !== 422) {
    error.value = null;
    return;
  }

  const e = ERROR_MESSAGES[apiError.message ?? ""];
  error.value = e ?? "Une erreur interne s'est produite";
};

export const useFormErrors = (key: string) => {
  const error = useFormErrorState(key);

  onBeforeRouteLeave(() => {
    error.value = null;
  });

  return {
    error,
  };
};
