export type PreviewVideo = {
  key: "gps" | "ranked" | "gameboy" | "final" | "bread" | "trains";
  channel: string;
  platform: "youtube" | "twitch";
  duration: string;
  time: string;
  tag?: "new" | "live" | "vod";
};

export const PREVIEW_VIDEOS: Array<PreviewVideo> = [
  {
    key: "gps",
    channel: "Lune Rouge",
    platform: "youtube",
    duration: "24:05",
    time: "21:04",
    tag: "new",
  },
  {
    key: "ranked",
    channel: "Nova Plays",
    platform: "twitch",
    duration: "3:12:40",
    time: "20:31",
    tag: "live",
  },
  {
    key: "gameboy",
    channel: "Pixel Lab",
    platform: "youtube",
    duration: "18:42",
    time: "18:12",
    tag: "new",
  },
  {
    key: "final",
    channel: "Kiro",
    platform: "twitch",
    duration: "3:58:40",
    time: "16:47",
    tag: "vod",
  },
  {
    key: "bread",
    channel: "Atelier Maxence",
    platform: "youtube",
    duration: "18:42",
    time: "14:05",
  },
  { key: "trains", channel: "Studio Brume", platform: "youtube", duration: "27:02", time: "11:30" },
];

export const PREVIEW_CHANNELS = [
  "Lune Rouge",
  "Nova Plays",
  "Pixel Lab",
  "Kiro",
  "Atelier Maxence",
  "Studio Brume",
  "Sol",
];

export const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TONES: Array<[string, string]> = [
  ["200 196 190", "70 66 62"],
  ["188 192 200", "56 60 70"],
  ["210 206 200", "84 80 76"],
  ["180 186 192", "48 52 60"],
  ["196 192 188", "64 60 58"],
  ["206 208 212", "78 80 86"],
];

const BLACK = [10, 10, 12];
const WHITE = [255, 255, 255];

const parse = (value: string) => value.split(" ").map(Number);
const mix = (a: Array<number>, b: Array<number>, t: number) =>
  a.map((v, i) => Math.round(v + (b[i]! - v) * t)).join(" ");

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

// Seeded so the server and the browser draw the same thumbnail
export const preview_scene = (
  index: number,
  platform: PreviewVideo["platform"],
  hook: string,
  uid: string,
) => {
  let seed = index * 7919 + 11;
  const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;

  const [from, to] = TONES[index % TONES.length]!;
  const f = parse(from);
  const t = parse(to);
  const W = 320;
  const H = 180;

  const layers = [0, 1, 2]
    .map((n) => {
      let points = `0,${H} `;
      for (let x = 0; x <= W; x += 32) {
        points += `${x},${Math.round(95 + n * 26 - rand() * (38 - n * 8))} `;
      }
      return `<polygon points="${points}${W},${H}" fill="rgb(${mix(t, BLACK, 0.15 + n * 0.22)})"/>`;
    })
    .join("");

  let subject: string;
  if (platform === "youtube") {
    const cx = 236 + rand() * 24;
    const body = mix(t, BLACK, 0.45);
    subject =
      `<circle cx="${cx}" cy="98" r="32" fill="rgb(${body})"/><rect x="${cx - 56}" y="128" width="112" height="70" rx="40" fill="rgb(${body})"/>` +
      (hook
        ? `<text x="18" y="52" transform="rotate(-3 18 52)" font-family="Geist, sans-serif" font-weight="600" font-size="${hook.length > 9 ? 22 : 27}" fill="#fff" stroke="#111" stroke-width="5" paint-order="stroke" stroke-linejoin="round" letter-spacing="-0.5">${escape(hook)}</text>`
        : "");
  } else {
    const chat = Array.from(
      { length: 10 },
      (_, n) =>
        `<rect x="252" y="${14 + n * 15}" width="${16 + rand() * 18}" height="4.5" rx="2.2" fill="rgb(255 255 255 / .55)"/><rect x="${272 + rand() * 6}" y="${14 + n * 15}" width="${14 + rand() * 22}" height="4.5" rx="2.2" fill="rgb(255 255 255 / .25)"/>`,
    ).join("");
    const cam = mix(t, BLACK, 0.65);
    subject = `<rect x="244" y="0" width="76" height="180" fill="rgb(14 14 16 / .85)"/>${chat}<rect x="168" y="62" width="68" height="44" rx="6" fill="rgb(${mix(t, BLACK, 0.3)})" stroke="rgb(255 255 255 / .4)" stroke-width="1.2"/><circle cx="202" cy="80" r="9" fill="rgb(${cam})"/><rect x="186" y="91" width="32" height="18" rx="9" fill="rgb(${cam})"/>`;
  }

  const sunX = 70 + rand() * 120;
  const sunY = 32 + rand() * 40;

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="s${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(${mix(t, BLACK, 0.1)})"/><stop offset=".8" stop-color="rgb(${from})"/></linearGradient><radialGradient id="l${uid}"><stop offset="0" stop-color="rgb(${mix(f, WHITE, 0.75)})"/><stop offset="1" stop-color="rgb(${from})" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#s${uid})"/><circle cx="${sunX}" cy="${sunY}" r="66" fill="url(#l${uid})"/>${layers}${subject}</svg>`;
};
