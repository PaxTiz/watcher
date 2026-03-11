import { fr } from "date-fns/locale";
import { format, formatDistance, setDefaultOptions } from "date-fns";
import type { VideosValidators } from '#shared/validators/videos'

type AnyDate = Date | string | number;

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
      format: (date: AnyDate) => {
        return format(date, "dd/MM/yyyy");
      },

      ago: (date: string) => {
        return formatDistance(date, new Date(), { addSuffix: true });
      },
    },

    videos: {
      filters: {
        name: (key: string) => {
          switch (key) {
            case 'service': return 'Service';
            case 'duration': return 'Duree';
            case 'date': return 'Date'
            default: return 'N/A'
          }
        },

        service: (key: VideosValidators['list']['query']['service']) => {
          switch (key) {
            case 'twitch': return 'Twitch';
            case 'youtube': return 'YouTube';
            default: return 'N/A'
          }
        },

        duration: (key: VideosValidators['list']['query']['duration']) => {
          switch (key) {
            case 'less_than_10_minutes': return '< 10 minutes';
            case 'between_10_30_minutes': return 'Entre 10 et 30 minutes';
            case 'between_30_60_minutes': return 'Entre 30 et 60 minutes';
            case 'greater_than_1_hour': return '> 60 minutes';
            default: return 'N/A'
          }
        },

        date: (key: VideosValidators['list']['query']['date']) => {
          switch (key) {
            case 'today': return 'Aujourd\'hui';
            case 'weekly': return 'Cette semaine';
            case 'monthly': return 'Ce mois';
            case 'yearly': return 'Cette année';
            case 'older': return 'Plus ancien';
            default: return 'N/A'
          }
        },
      }
    }
  };
};
