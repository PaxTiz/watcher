export type Platform = "twitch" | "youtube";

export const PLATFORM_COLORS: Record<Platform, string> = {
  twitch: "#9146ff",
  youtube: "#ff0033",
};

export const CREATORS = {
  nova: { name: "Nova Kestrel", initials: "NK", color: "#6d4fd6" },
  brume: { name: "Studio Brume", initials: "SB", color: "#1f7a6e" },
  oto: { name: "Oto Maru", initials: "OM", color: "#b5561a" },
  lena: { name: "Lena Orsay", initials: "LO", color: "#c2386a" },
  theo: { name: "Théo Barral", initials: "TB", color: "#3a68b8" },
  pivoine: { name: "Atelier Pivoine", initials: "AP", color: "#5f7220" },
} as const;

export type CreatorKey = keyof typeof CREATORS;

const MOON =
  "radial-gradient(circle at 74% 30%,rgba(255,236,190,.95) 0 6%,rgba(255,236,190,0) 7%),";

export const SCENES = {
  paint: `${MOON}linear-gradient(165deg,#161a45 0%,#5b3a9c 58%,#f2a65a 100%)`,
  paint2: `${MOON}linear-gradient(165deg,#0f2b3d 0%,#2d5f87 60%,#c98a6a 100%)`,
  ice: "linear-gradient(180deg,#c9dde8 0%,#eef4f6 52%,#56717e 52%,#2f4753 100%)",
  synth:
    "repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 2px,transparent 2px 14px),linear-gradient(135deg,#2a2a30,#4b2a1d 70%,#e0803a)",
  cook: "radial-gradient(circle at 28% 62%,#f7c66b 0 16%,transparent 17%),radial-gradient(circle at 62% 45%,#e8604c 0 12%,transparent 13%),linear-gradient(135deg,#f9e4cf,#f0b98e)",
  game: "linear-gradient(0deg,rgba(0,0,0,.25),rgba(0,0,0,0)),repeating-linear-gradient(0deg,#1d2b4f 0 12px,#243665 12px 24px)",
  sky: "linear-gradient(180deg,#0b1030,#2a2f6b 50%,#7e5aa6)",
  plant:
    "radial-gradient(circle at 50% 70%,#7fb069 0 22%,transparent 23%),linear-gradient(160deg,#eaf3df,#c7dfb5)",
  notes:
    "repeating-linear-gradient(0deg,rgba(0,0,0,.06) 0 1px,transparent 1px 18px),linear-gradient(135deg,#f6ecd9,#e9d7b4)",
  scope:
    "radial-gradient(circle at 50% 50%,transparent 0 24%,#39ff88 25% 27%,transparent 28%),linear-gradient(135deg,#0b1b12,#103021)",
} as const;

export type PreviewVideo = {
  key: string;
  creator: CreatorKey;
  platform: Platform;
  duration: string;
  scene: keyof typeof SCENES;
  live?: boolean;
};

const video = (
  key: string,
  creator: CreatorKey,
  platform: Platform,
  duration: string,
  scene: keyof typeof SCENES,
  live = false,
): PreviewVideo => ({ key, creator, platform, duration, scene, live });

export const VIDEOS = {
  live: video("live", "nova", "twitch", "LIVE", "paint", true),
  ice: video("ice", "brume", "youtube", "24:10", "ice"),
  notes: video("notes", "brume", "youtube", "12:36", "notes"),
  synth: video("synth", "oto", "youtube", "41:52", "synth"),
  scope: video("scope", "oto", "youtube", "18:20", "scope"),
  rediff: video("rediff", "nova", "youtube", "2:12:40", "paint2"),
  clip: video("clip", "nova", "youtube", "0:40", "sky"),
  cook: video("cook", "lena", "youtube", "18:07", "cook"),
  plant: video("plant", "pivoine", "youtube", "9:45", "plant"),
  game: video("game", "theo", "twitch", "3:05:11", "game"),
} satisfies Record<string, PreviewVideo>;
