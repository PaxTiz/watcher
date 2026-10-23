import { format, formatDistanceToNow, type Locale } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";

import { useNuxtApp } from "#imports";

import type { LocaleCode } from "../../locales";

type AnyDate = Date | string | number;

const DATE_LOCALES: Record<LocaleCode, Locale> = { en: enUS, fr, es };

export const useWatcherFormatter = () => {
  const { locale } = useNuxtApp().$i18n;

  const dateLocale = () => DATE_LOCALES[locale.value as LocaleCode] ?? enUS;

  return {
    numbers: {
      compact: (value: number) =>
        new Intl.NumberFormat(locale.value, {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value),

      displaySeconds: (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const paddedSeconds = String(seconds).padStart(2, "0");

        if (hours > 0) {
          const paddedMinutes = String(minutes).padStart(2, "0");
          return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        }

        return `${minutes}:${paddedSeconds}`;
      },
    },

    dates: {
      format: (date: AnyDate) => format(date, "P", { locale: dateLocale() }),

      ago: (date: AnyDate) => formatDistanceToNow(date, { addSuffix: true, locale: dateLocale() }),
    },
  };
};
