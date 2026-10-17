import { join } from "node:path";

import type { VideoPalette } from "@watcher/common";
import sharp from "sharp";

import { useLogger } from "#framework";

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads");

const SAMPLE_WIDTH = 48;
const SAMPLE_HEIGHT = 27;

type Rgb = [number, number, number];

const rgb_to_hsl = ([r, g, b]: Rgb): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;

  return [h, s, l];
};

const hsl = (h: number, s: number, l: number) => {
  if (s === 0) {
    const v = Math.round(l * 255);
    return `${v} ${v} ${v}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)]
    .map((v) => Math.round(v * 255))
    .join(" ");
};

const weighted_average = (data: Buffer, columns: readonly [number, number]): Rgb => {
  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;

  for (let y = 0; y < SAMPLE_HEIGHT; y++) {
    for (let x = columns[0]; x < columns[1]; x++) {
      const i = (y * SAMPLE_WIDTH + x) * 3;
      const pixel: Rgb = [data[i]!, data[i + 1]!, data[i + 2]!];
      const [, s, l] = rgb_to_hsl(pixel);
      const weight = 0.05 + s * s * (1 - Math.abs(l - 0.5) * 1.6);

      r += pixel[0] * weight;
      g += pixel[1] * weight;
      b += pixel[2] * weight;
      total += weight;
    }
  }

  return [r / total, g / total, b / total];
};

const boosted_saturation = (s: number) => Math.min(1, Math.max(0.45, s * 1.4));

export const extract_image_palette = async (path: string): Promise<VideoPalette | null> => {
  try {
    const { data } = await sharp(join(UPLOADS_DIRECTORY, path))
      .resize(SAMPLE_WIDTH, SAMPLE_HEIGHT, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const [h, s] = rgb_to_hsl(weighted_average(data, [0, SAMPLE_WIDTH]));
    const saturation = boosted_saturation(s);

    const third = SAMPLE_WIDTH / 3;
    const regions = (
      [
        [0, third],
        [third, third * 2],
        [third * 2, SAMPLE_WIDTH],
      ] as const
    ).map((columns) => {
      const [rh, rs] = rgb_to_hsl(weighted_average(data, columns));
      return hsl(rh, boosted_saturation(rs), 0.5);
    }) as VideoPalette["regions"];

    return {
      base: hsl(h, saturation, 0.5),
      vivid: hsl(h, Math.min(1, saturation + 0.15), 0.58),
      light: hsl(h, Math.min(1, saturation + 0.1), 0.78),
      dark: hsl(h, Math.min(0.7, saturation), 0.13),
      ink: hsl(h, Math.min(0.8, saturation + 0.1), 0.32),
      regions,
    };
  } catch (error) {
    useLogger("server.utils.palette").warn({ err: error, path }, "Failed to extract image palette");
    return null;
  }
};
