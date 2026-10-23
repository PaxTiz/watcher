import type { VideosValidators } from "#shared/validators/videos";

type Query = VideosValidators["list"]["query"];

export const useFormatter = () => {
  const { t } = useNuxtApp().$i18n;
  const { numbers, dates } = useWatcherFormatter();

  return {
    numbers,
    dates,

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
