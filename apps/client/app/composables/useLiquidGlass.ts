import type { MaybeElementRef } from "@vueuse/core";

const SVG_NS = "http://www.w3.org/2000/svg";

// Only Chromium supports SVG filters in `backdrop-filter`; elsewhere the glass stays unlensed
const supports_lens = () => {
  const brands = (navigator as Navigator & { userAgentData?: { brands: Array<{ brand: string }> } })
    .userAgentData?.brands;

  return !!brands?.some((b) => b.brand === "Chromium");
};

let filters_host: SVGSVGElement | null = null;
let sequence = 0;

const get_filters_host = () => {
  if (!filters_host) {
    filters_host = document.createElementNS(SVG_NS, "svg");
    filters_host.setAttribute("width", "0");
    filters_host.setAttribute("height", "0");
    filters_host.setAttribute("aria-hidden", "true");
    filters_host.style.position = "absolute";
    document.body.appendChild(filters_host);
  }

  return filters_host;
};

/**
 * Displacement map of a rounded rectangle: pixels close to the rim sample from further
 * inside, so what passes under the edges bends like through a thick lens.
 */
const displacement_map = (width: number, height: number, radius: number, bezel: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d")!;
  const image = context.createImageData(width, height);
  const data = image.data;

  const half_w = width / 2;
  const half_h = height / 2;
  const r = Math.min(radius, half_w, half_h);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - half_w;
      const py = y + 0.5 - half_h;
      const qx = Math.abs(px) - (half_w - r);
      const qy = Math.abs(py) - (half_h - r);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const inside = -(Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r);

      let dx = 0;
      let dy = 0;

      if (inside > 0 && inside < bezel) {
        let nx: number;
        let ny: number;

        if (ox > 0 || oy > 0) {
          const length = Math.hypot(ox, oy) || 1;
          nx = (Math.sign(px) * ox) / length;
          ny = (Math.sign(py) * oy) / length;
        } else if (qx > qy) {
          nx = Math.sign(px);
          ny = 0;
        } else {
          nx = 0;
          ny = Math.sign(py);
        }

        const t = 1 - inside / bezel;
        const strength = t * t * (3 - 2 * t);
        dx = -nx * strength;
        dy = -ny * strength;
      }

      const i = (y * width + x) * 4;
      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
};

/**
 * Adds the lens effect to an element using the `liquid-glass` utility.
 * The filter is rebuilt when the element is resized, since the map depends on its size.
 */
export const useLiquidGlass = (target: MaybeElementRef<HTMLElement | null | undefined>) => {
  if (import.meta.server) {
    return;
  }

  let filter: SVGFilterElement | null = null;

  const build = () => {
    const element = unrefElement(target) as HTMLElement | null | undefined;
    if (!element || !supports_lens()) {
      return;
    }

    const width = Math.round(element.offsetWidth);
    const height = Math.round(element.offsetHeight);
    if (!width || !height) {
      return;
    }

    const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || height / 2;
    // A thin bezel and a small scale: the bend should be noticed, not seen
    const bezel = Math.min(height / 2, 16);
    const id = `liquid-glass-${++sequence}`;

    filter?.remove();
    filter = document.createElementNS(SVG_NS, "filter");
    filter.id = id;
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", String(width));
    filter.setAttribute("height", String(height));
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("primitiveUnits", "userSpaceOnUse");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    filter.innerHTML = `
      <feImage href="${displacement_map(width, height, radius, bezel)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" result="map" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${Math.round(bezel * 1.3)}" xChannelSelector="R" yChannelSelector="G" />
    `;
    get_filters_host().appendChild(filter);

    element.style.setProperty("--glass-lens", `url(#${id})`);
    element.classList.add("liquid-glass-lens");
  };

  useResizeObserver(target, useDebounceFn(build, 150));
  onMounted(build);
  onBeforeUnmount(() => filter?.remove());
};
