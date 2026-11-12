export type Guest = {
  key: string; // identifies a person whatever the way it's written: "@SuperYoutuber", "Super Youtuber"
  name: string; // as written in the title
};

export type ExtractGuestsOptions = {
  // Keys of the people already known (channels, guests found with a reliable marker): a name found
  // with an ambiguous marker ("avec", "x") is only kept when it's one of them
  known_keys: ReadonlySet<string>;
  // Name of the channel publishing the video, which is never its own guest
  channel_name?: string;
};

const LETTER = "\\p{L}\\p{N}";

const HANDLE = new RegExp(`(?<![${LETTER}_.])@([${LETTER}_.-]+)`, "gu");

// Followed by the list of guests
const RELIABLE_MARKER = new RegExp(
  `(?<![${LETTER}])(?:featuring|feat|ft)(?![${LETTER}])\\.?:?`,
  "giu",
);
const AMBIGUOUS_MARKER = new RegExp(`(?<![${LETTER}])(?:avec|with|w/)(?![${LETTER}])`, "giu");

// Where a list of guests ends: brackets, separators, punctuation ending a sentence
const LIST_END = /[()[\]{}|#!?:;"«»“”\n]|\s[-–—]|[-–—]\s|\s\/\/\s/u;
const LIST_SEPARATOR = /\s*(?:,|&|\+|\/|\s(?:et|and|x|×)\s)\s*/iu;
const COLLAB_SEPARATOR = /\s(?:x|×)\s/iu;

const MAX_NAME_LENGTH = 40;
const MAX_NAME_WORDS = 4;

export const guest_key = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(new RegExp(`[^${LETTER}]`, "gu"), "");

// Leading and trailing punctuation and emojis aren't part of the name
const clean_name = (value: string) =>
  value.replace(new RegExp(`^[^${LETTER}@]+|[^${LETTER}]+$`, "gu"), "").replace(/^@/, "");

const is_name = (name: string) =>
  name.length >= 2 &&
  name.length <= MAX_NAME_LENGTH &&
  name.split(/\s+/).length <= MAX_NAME_WORDS &&
  // "mon papa": a name of several words starts with an uppercase letter
  (!/\s/.test(name) || !/^\p{Ll}/u.test(name)) &&
  !/^(?:etc|\.+|…)$/iu.test(name) &&
  new RegExp(`[${LETTER}]`, "u").test(name);

// Names listed right after a marker, until the list ends
function names_after(title: string, marker: RegExp): Array<string> {
  const names = [];

  for (const match of title.matchAll(marker)) {
    const rest = title.slice(match.index + match[0].length);
    const list = rest.split(LIST_END)[0] ?? "";

    names.push(...list.split(LIST_SEPARATOR).map(clean_name));
  }

  return names;
}

function collaborators(title: string): Array<string> {
  return title
    .split(LIST_END)
    .filter((segment) => COLLAB_SEPARATOR.test(segment))
    .flatMap((segment) => segment.split(COLLAB_SEPARATOR).map(clean_name));
}

export function extract_guests(title: string, options: ExtractGuestsOptions): Array<Guest> {
  const reliable = [
    ...Array.from(title.matchAll(HANDLE), (match) => clean_name(match[1] ?? "")),
    ...names_after(title, RELIABLE_MARKER),
  ];
  const ambiguous = [...names_after(title, AMBIGUOUS_MARKER), ...collaborators(title)];

  const channel_key = options.channel_name ? guest_key(options.channel_name) : undefined;
  const guests = new Map<string, Guest>();

  const add = (name: string, is_reliable: boolean) => {
    const key = guest_key(name);

    if (
      !is_name(name) ||
      key.length < 2 ||
      key === channel_key ||
      guests.has(key) ||
      (!is_reliable && !options.known_keys.has(key))
    ) {
      return;
    }

    guests.set(key, { key, name });
  };

  reliable.forEach((name) => add(name, true));
  ambiguous.forEach((name) => add(name, false));

  return [...guests.values()];
}
