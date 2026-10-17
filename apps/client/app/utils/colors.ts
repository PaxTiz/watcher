const hex_to_rgb = (hex: string): [number, number, number] | null => {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) {
    return null;
  }

  return [parseInt(match[1]!, 16), parseInt(match[2]!, 16), parseInt(match[3]!, 16)];
};

const rgb_to_hsl = (r: number, g: number, b: number): [number, number, number] => {
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

const hsl_to_rgb = (h: number, s: number, l: number) => {
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

/**
 * Turns a thumbnail's average colour into usable tones: thumbnails are often dull,
 * so saturation is pushed up and lightness fixed per role.
 */
export const color_tones = (hex: string | null | undefined) => {
  const rgb = hex ? hex_to_rgb(hex) : null;
  if (!rgb) {
    return null;
  }

  const [h, s] = rgb_to_hsl(...rgb);
  const saturation = Math.min(1, Math.max(0.45, s * 1.4));

  return {
    base: hsl_to_rgb(h, saturation, 0.5),
    vivid: hsl_to_rgb(h, Math.min(1, saturation + 0.15), 0.58),
    light: hsl_to_rgb(h, Math.min(1, saturation + 0.1), 0.78),
    dark: hsl_to_rgb(h, Math.min(0.7, saturation), 0.13),
    // Readable on white, for small text in the light theme
    ink: hsl_to_rgb(h, Math.min(0.8, saturation + 0.1), 0.32),
  };
};

// CSS variables consumed by the `video-tinted` utility and `rgb(var(--c) / x)` colours
export const video_tones_style = (hex: string | null | undefined) => {
  const tones = color_tones(hex);
  if (!tones) {
    return {};
  }

  return {
    "--c": tones.base,
    "--c-vivid": tones.vivid,
    "--c-light": tones.light,
    "--c-dark": tones.dark,
    "--c-ink": tones.ink,
  };
};
