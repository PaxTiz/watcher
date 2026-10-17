const container = shallowRef<HTMLElement | null>(null);

export const useAppScroll = () => {
  const scroll_to_top = (behavior: ScrollBehavior = "smooth") => {
    container.value?.scrollTo({ top: 0, behavior });
  };

  return { container, scroll_to_top };
};
