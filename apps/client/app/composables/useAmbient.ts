import type { VideoResource } from "@watcher/common";

type AmbientSource = Pick<VideoResource, "thumbnail" | "color">;

let owners = 0;

// The app takes its light from the page's main video, if it has one
export const useAmbient = () => {
  const source = useState<AmbientSource | null>("ambient.source", () => null);
  const owner = useState<number>("ambient.owner", () => 0);

  return { source, owner };
};

/**
 * Lights the app with the page's main video while the page is displayed.
 * The next page may mount before this one unmounts, hence the owner check.
 */
export const usePageAmbient = (getter: () => AmbientSource | null | undefined) => {
  const { source, owner } = useAmbient();
  const id = ++owners;

  watchEffect(() => {
    const video = getter();
    owner.value = id;
    source.value = video ? { thumbnail: video.thumbnail, color: video.color } : null;
  });

  onBeforeUnmount(() => {
    if (owner.value === id) {
      source.value = null;
    }
  });
};
