type PageNavigationItem = {
  label: string;
  icon?: string;
  to?: string;
};

export const usePageNavigation = () => {
  const items = useState<Array<PageNavigationItem>>("page_navigation_items", () => []);

  const set_breadcrumb = (new_items: MaybeRefOrGetter<Array<PageNavigationItem | undefined>>) => {
    items.value = toValue(new_items).filter((item) => item !== undefined);
  };

  return Object.assign(set_breadcrumb, { items });
};
