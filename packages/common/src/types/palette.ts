// Colours of a video, computed from its thumbnail at sync. Each value is "r g b", for `rgb(var(--x) / a)`.
export type VideoPalette = {
  // Dominant colour, saturated
  base: string;

  // Brighter, for progress bars and accents
  vivid: string;

  // Very light, for text on dark surfaces
  light: string;

  // Very dark, for tinted surfaces in the dark theme
  dark: string;

  // Dark enough to read on white, for text in the light theme
  ink: string;

  // Dominant colour of the left, center and right thirds, for ambient lights
  regions: [string, string, string];
};
