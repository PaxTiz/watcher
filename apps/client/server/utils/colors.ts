import { join } from "node:path";

import sharp from "sharp";

import { useLogger } from "#framework";

const UPLOADS_DIRECTORY = join(process.cwd(), ".storage", "uploads");

// Small enough to be fast, large enough to keep the image's main areas
const SAMPLE_WIDTH = 32;
const SAMPLE_HEIGHT = 18;

const saturation_and_lightness = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;

  if (max === min) {
    return { saturation: 0, lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  return { saturation, lightness };
};

const to_hex = (value: number) => Math.round(value).toString(16).padStart(2, "0");

/**
 * Average colour of an uploaded image, weighted towards saturated mid-tones so that
 * a thumbnail's dominant hue wins over its blacks, whites and greys.
 */
export const extract_image_color = async (path: string): Promise<string | null> => {
  try {
    const { data } = await sharp(join(UPLOADS_DIRECTORY, path))
      .resize(SAMPLE_WIDTH, SAMPLE_HEIGHT, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let r = 0;
    let g = 0;
    let b = 0;
    let total_weight = 0;

    for (let i = 0; i < data.length; i += 3) {
      const { saturation, lightness } = saturation_and_lightness(
        data[i]!,
        data[i + 1]!,
        data[i + 2]!,
      );
      const weight = 0.05 + saturation * saturation * (1 - Math.abs(lightness - 0.5) * 1.6);

      r += data[i]! * weight;
      g += data[i + 1]! * weight;
      b += data[i + 2]! * weight;
      total_weight += weight;
    }

    return `#${to_hex(r / total_weight)}${to_hex(g / total_weight)}${to_hex(b / total_weight)}`;
  } catch (error) {
    useLogger("server.utils.colors").warn({ err: error, path }, "Failed to extract image color");
    return null;
  }
};
