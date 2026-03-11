import type { VideosValidators } from '~~/shared/validators/videos';

export type VideoFilterType = 'service' | 'duration' | 'date'
export type VideoFilterEmit = {
  type: VideoFilterType;
  value: VideosValidators['list']['query'][VideoFilterType]
}

export const useVideosFilters = () => {
  const filters = useState<Pick<VideosValidators['list']['query'], VideoFilterType>>('videos_filters', () => ({
    service: undefined,
    duration: undefined,
    date: undefined,
  }))

  return {
    filters,
  }
}
