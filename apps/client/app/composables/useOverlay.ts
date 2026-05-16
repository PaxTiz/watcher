import type { Component } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";

import { randomId } from "#shared/utils/random";

type Props<C extends Component> = Omit<ComponentProps<C>, "overlayIdInternal">;

type Overlay<C extends Component, P extends Props<C>> = {
  id: string;
  component: C;
  isMounted: boolean;
  isVisible: boolean;
  props?: P;
};

export const useOverlay = () => {
  const overlays = useState<Array<Overlay<any, any>>>("overlays", () => []);

  const getOverlay = (id: string) => {
    const overlay = overlays.value.find((e) => e.id === id);
    if (!overlay) {
      throw new Error(`Could not find overlay with id ${id}`);
    }

    return overlay;
  };

  const isMounted = (id: string) => {
    return getOverlay(id).isVisible;
  };

  const create = <C extends Component, P extends Props<C>>(component: C) => {
    const id = randomId();
    overlays.value.push({
      id,
      component: markRaw(component),
      isMounted: true,
      isVisible: false,
    });

    return {
      open: (p: P = {} as P) => open(id, { props: p }),
    };
  };

  const open = <C extends Component, P extends Props<C>>(id: string, data?: { props?: P }) => {
    const overlay = getOverlay(id);

    overlay.props = data?.props;
    overlay.isMounted = true;
    overlay.isVisible = true;
  };

  const close = (id: string) => {
    const overlay = getOverlay(id);
    overlay.isVisible = false;
  };

  const destroy = (id: string) => {
    overlays.value = overlays.value.filter((o) => o.id !== id);
  };

  return {
    overlays,
    isMounted,
    create,
    open,
    close,
    destroy,
  };
};
