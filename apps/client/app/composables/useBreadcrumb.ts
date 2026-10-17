let owners = 0;

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

  // The next page may mount before this one unmounts, hence the owner check
  onBeforeUnmount(() => {
    if (owner.value === id) {
      label.value = null;
    }
  });
};
