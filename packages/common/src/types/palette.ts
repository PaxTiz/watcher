// Each value is "r g b", to be used as `rgb(var(--x) / a)`
export type VideoPalette = {
  base: string;

  vivid: string;

  light: string;

  dark: string;

  ink: string;

  regions: [string, string, string];
};
