import type { VideosValidators } from "#shared/validators/videos";

type Query = VideosValidators["list"]["query"];

export const useFormatter = () => {
  const { t } = useNuxtApp().$i18n;
  const { numbers, dates } = useWatcherFormatter();

  return {
    numbers,
    dates,

    errors: {
      too_many_attempts: (retry_after?: number) =>
        retry_after
          ? t("errors.too_many_attempts", { delay: dates.ago(Date.now() + retry_after * 1000) })
          : t("errors.too_many_attempts_later"),
    },

    videos: {
      filters: {
        service: (key: Query["service"]) => {
          switch (key) {
            case "twitch":
              return "Twitch";
            case "youtube":
              return "YouTube";
            default:
              return "N/A";
          }
        },

        duration: (key: NonNullable<Query["duration"]>) => t(`videos.filters.durations.${key}`),

        date: (key: NonNullable<Query["date"]>) => t(`videos.filters.dates.${key}`),
      },
    },
  };
};
