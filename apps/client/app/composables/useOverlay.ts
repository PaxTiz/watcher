import type { Component } from "vue";
import type { ComponentEmit, ComponentProps } from "vue-component-type-helpers";

import { randomId } from "#shared/utils/random";

type Props<C extends Component> = Omit<ComponentProps<C>, "overlayIdInternal">;
type CloseEventArgs<T> = T extends (event: "close", arg_0: infer Arg, ...args: any[]) => void
  ? Arg
  : never;

export type Overlay<C extends Component, P extends Props<C>> = {
  id: string;
  component: C;
  isMounted: boolean;
  isVisible: boolean;
  props?: P;
  resolvePromise?: (value: any) => void;
};

export const useOverlay = () => {
  const body = useState<HTMLBodyElement | null>("body", () => null);
  const isScrollLocked = useScrollLock(body);

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
      open: (p: P = {} as P) => open<C, P>(id, { props: p }),
    };
  };

  const open = <
    C extends Component,
    P extends Props<C>,
    R extends CloseEventArgs<ComponentEmit<C>> = CloseEventArgs<ComponentEmit<C>>,
  >(
    id: string,
    data?: { props?: P },
  ) => {
    const overlay = getOverlay(id);

    overlay.props = data?.props;
    overlay.isMounted = true;
    overlay.isVisible = true;

    const result = new Promise<R>((resolve) => (overlay.resolvePromise = resolve));
    return {
      result,
    };
  };

  const close = (id: string, result?: any) => {
    const overlay = getOverlay(id);
    overlay.isVisible = false;

    if (overlay.resolvePromise) {
      overlay.resolvePromise(result);
      overlay.resolvePromise = undefined;
    }
  };

  const destroy = (id: string) => {
    overlays.value = overlays.value.filter((o) => o.id !== id);
  };

  watchEffect(() => {
    if (import.meta.server) {
      return;
    }

    body.value = document.querySelector("body") as HTMLBodyElement;
    isScrollLocked.value = overlays.value.length > 0;
  });

  return {
    overlays,
    isMounted,
    create,
    open,
    close,
    destroy,
  };
};
