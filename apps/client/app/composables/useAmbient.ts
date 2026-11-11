import type { VideoResource } from "@watcher/common";

type AmbientSource = Pick<VideoResource, "palette">;

let owners = 0;

export const useAmbient = () => {
  const palette = useState<VideoResource["palette"]>("ambient.palette", () => null);
  const owner = useState<number>("ambient.owner", () => 0);
  const muted = useState<boolean>("ambient.muted", () => false);

  return { palette, owner, muted };
};

export const usePageAmbient = (
  getter: () => AmbientSource | null | undefined,
  is_muted: () => boolean = () => false,
) => {
  const { palette, owner, muted } = useAmbient();
  const id = ++owners;

  watchEffect(() => {
    owner.value = id;
    palette.value = getter()?.palette ?? null;
    muted.value = is_muted();
  });

  onBeforeUnmount(() => {
    if (owner.value === id) {
      palette.value = null;
      muted.value = false;
    }
  });
};
