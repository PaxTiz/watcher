import { fr } from "date-fns/locale";
import { formatDistance, setDefaultOptions } from "date-fns";

export const useFormatter = () => {
  setDefaultOptions({ locale: fr });

  return {
    dates: {
      ago: (date: string) => {
        return formatDistance(date, new Date(), { addSuffix: true });
      },
    },
  };
};
