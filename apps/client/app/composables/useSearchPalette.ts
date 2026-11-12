import { ContentSearch } from "#components";
import { search } from "~/utils/search";

export const useSearchPalette = () => {
  const overlay = useWatcherOverlay();

  const open_search = async () => {
    const result = await overlay.create(ContentSearch).open({ searchFn: search }).result;

    if (result?.kind === "video") {
      await navigateTo(`/videos/${result.video.id}`);
    } else if (result?.kind === "channel") {
      await navigateTo(`/subscriptions/${result.channel.slug}`);
    }
  };

  return { open_search };
};
