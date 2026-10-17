let owners = 0;

// Last crumb of the top bar, set by pages showing a specific item (a video, a channel)
export const useBreadcrumb = () => {
  const label = useState<string | null>("breadcrumb.label", () => null);
  const owner = useState<number>("breadcrumb.owner", () => 0);

  return { label, owner };
};

export const usePageBreadcrumb = (getter: () => string | null | undefined) => {
  const { label, owner } = useBreadcrumb();
  const id = ++owners;

  watchEffect(() => {
    owner.value = id;
    label.value = getter() ?? null;
  });

  // The next page may mount before this one unmounts
  onBeforeUnmount(() => {
    if (owner.value === id) {
      label.value = null;
    }
  });
};
