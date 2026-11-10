export type ShortcutGroup = "general" | "navigation" | "video";

export type ShortcutDefinition = {
  key: string;
  group: ShortcutGroup;
  mod?: boolean;
  shift?: boolean;
  editable?: boolean;
};

export const shortcuts = {
  search: { key: "k", group: "general", mod: true, editable: true },
  toggle_sidebar: { key: "/", group: "general", mod: true },
  help: { key: "?", group: "general" },
  videos: { key: "v", group: "navigation", shift: true },
  favorites: { key: "f", group: "navigation", shift: true },
  theater: { key: "t", group: "video", shift: true },
} satisfies Record<string, ShortcutDefinition>;

export type ShortcutName = keyof typeof shortcuts;

export const player_shortcuts = [
  { keys: ["Space", "K"], action: "play" },
  { keys: ["F"], action: "fullscreen" },
  { keys: ["M"], action: "mute" },
  { keys: ["←", "→"], action: "seek" },
  { keys: ["J", "L"], action: "seek" },
  { keys: ["↑", "↓"], action: "volume" },
  { keys: ["C"], action: "captions" },
  { keys: ["I"], action: "pip" },
  { keys: ["0-9"], action: "jump" },
] as const;
