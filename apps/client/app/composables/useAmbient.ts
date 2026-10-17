import type { VideoResource } from "@watcher/common";

type AmbientSource = Pick<VideoResource, "palette">;

let owners = 0;

// The app takes its light from the page's main video, if it has one
export const useAmbient = () => {
  const palette = useState<VideoResource["palette"]>("ambient.palette", () => null);
  const owner = useState<number>("ambient.owner", () => 0);

  return { palette, owner };
};

/**
 * Lights the app with the page's main video while the page is displayed.
 * The next page may mount before this one unmounts, hence the owner check.
 */
export const usePageAmbient = (getter: () => AmbientSource | null | undefined) => {
  const { palette, owner } = useAmbient();
  const id = ++owners;

  watchEffect(() => {
    owner.value = id;
    palette.value = getter()?.palette ?? null;
  });

  onBeforeUnmount(() => {
    if (owner.value === id) {
      palette.value = null;
    }
  });
};
