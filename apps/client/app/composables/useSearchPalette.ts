import { ContentSearch } from "#components";
import { mockSearch } from "~/utils/search";

export const useSearchPalette = () => {
  const overlay = useWatcherOverlay();

  const open_search = () => {
    overlay.create(ContentSearch).open({ searchFn: mockSearch });
  };

  return { open_search };
};
