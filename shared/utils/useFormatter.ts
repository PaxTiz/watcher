import { fr } from "date-fns/locale";
import { formatDistance, setDefaultOptions } from "date-fns";

export const useFormatter = () => {
  setDefaultOptions({ locale: fr });

  return {
    numbers: {
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
      ago: (date: string) => {
        return formatDistance(date, new Date(), { addSuffix: true });
      },
    },
  };
};
