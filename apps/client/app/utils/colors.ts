import type { VideoPalette } from "@watcher/common";

export const video_tones_style = (palette: VideoPalette | null | undefined) => {
  if (!palette) {
    return {};
  }

  return {
    "--c": palette.base,
    "--c-vivid": palette.vivid,
    "--c-light": palette.light,
    "--c-dark": palette.dark,
    "--c-ink": palette.ink,
  };
};

export const palette_light = (palette: VideoPalette | null | undefined, opacity = 0.5) => {
  if (!palette) {
    return "none";
  }

  const [left, center, right] = palette.regions;

  return [
    `radial-gradient(55% 80% at 12% 0%, rgb(${left} / ${opacity}) 0%, transparent 70%)`,
    `radial-gradient(50% 85% at 50% -10%, rgb(${center} / ${opacity}) 0%, transparent 72%)`,
    `radial-gradient(55% 80% at 88% 0%, rgb(${right} / ${opacity}) 0%, transparent 70%)`,
  ].join(", ");
};

export const palette_glow = (palette: VideoPalette | null | undefined, opacity = 0.5) => {
  if (!palette) {
    return "none";
  }

  const [left, center, right] = palette.regions;

  return [
    `radial-gradient(40% 60% at 6% 50%, rgb(${left} / ${opacity}) 0%, transparent 100%)`,
    `radial-gradient(50% 45% at 50% 4%, rgb(${center} / ${opacity}) 0%, transparent 100%)`,
    `radial-gradient(50% 45% at 50% 96%, rgb(${center} / ${opacity}) 0%, transparent 100%)`,
    `radial-gradient(40% 60% at 94% 50%, rgb(${right} / ${opacity}) 0%, transparent 100%)`,
  ].join(", ");
};

export const palette_sides = (palette: VideoPalette | null | undefined, opacity = 0.18) => {
  if (!palette) {
    return null;
  }

  const [left, , right] = palette.regions;
  const vignette =
    "linear-gradient(to bottom, rgb(0 0 0 / 0.35), transparent 35%, transparent 65%, rgb(0 0 0 / 0.35))";
  const side = (color: string, direction: string) =>
    `${vignette}, linear-gradient(to ${direction}, rgb(${color} / ${opacity}), transparent 32rem)`;

  return { left: side(left, "left"), right: side(right, "right") };
};
