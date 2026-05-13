export const ERROR_MESSAGES: Record<string, string> = {};

export const useFormErrors = (key: string) => {
  const error = useState<string | null>(key, () => null);

  const setError = (rawError: string | null) => {
    if (rawError === null) {
      error.value = null;
      return;
    }

    const e = ERROR_MESSAGES[rawError];
    error.value = e ?? "Une erreur interne s'est produite";
  };

  onBeforeRouteLeave(() => {
    error.value = null;
  });

  return {
    error,
    setError,
  };
};
