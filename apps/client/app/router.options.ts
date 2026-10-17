import type { RouterConfig } from "@nuxt/schema";

// Scroll positions of the content panel, by page, to restore them on back/forward
const positions = new Map<string, number>();

export default {
  scrollBehavior(to, from, saved_position) {
    const { container } = useAppScroll();
    const nuxt_app = useNuxtApp();

    if (container.value) {
      positions.set(from.fullPath, container.value.scrollTop);
    }

    // Query-only changes (filters, pagination) stay on the same page, which handles its own scroll
    if (to.path === from.path) {
      return false;
    }

    // Wait for the new page to be rendered before scrolling its panel
    return new Promise((resolve) => {
      let done = false;
      const scroll = () => {
        if (done) {
          return;
        }

        done = true;
        requestAnimationFrame(() => {
          container.value?.scrollTo({
            top: saved_position ? (positions.get(to.fullPath) ?? 0) : 0,
          });
          resolve(false);
        });
      };

      nuxt_app.hooks.hookOnce("page:finish", scroll);
      // Never leave the navigation hanging if the page doesn't report back
      setTimeout(scroll, 1500);
    });
  },
} satisfies RouterConfig;
