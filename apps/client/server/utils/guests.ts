export type Guest = {
  key: string; // identifies a person whatever the way it's written: "@SuperYoutuber", "Super Youtuber"
  subscription_id: string;
};

export type KnownChannels = {
  by_key: ReadonlyMap<string, Guest>;
  // Comparable forms of their names, searched anywhere in titles
  forms: ReadonlyArray<{ form: string; without_spaces: boolean; guest: Guest }>;
};

export type ExtractGuestsOptions = {
  channels: KnownChannels;
  channel_name?: string; // a channel is never its own guest
};

const LETTER = "\\p{L}\\p{N}";

const HANDLE = new RegExp(`(?<![${LETTER}_.])@([${LETTER}_.-]+)`, "gu");

// Conventions of YouTube and music, used as is whatever the language of the title
const RELIABLE_MARKER = new RegExp(
  `(?<![${LETTER}])(?:featuring|feat|ft)(?![${LETTER}])\\.?:?`,
  "giu",
);

const LIST_END =
  /[()[\]{}|#!?:;"«»“”\n【】「」『』（）［］｜！？：]|\s[-–—]|[-–—]\s|\s\/\/\s|\s(?=@)/u;
const CONJUNCTIONS = ["et", "and", "y", "e", "und", "en", "i", "и", "ve", "og", "och", "és", "x"];
const LIST_SEPARATOR = new RegExp(
  `\\s*(?:[,&+/、・，＆×]|\\s(?:${CONJUNCTIONS.join("|")})\\s)\\s*`,
  "iu",
);

// Scripts written without spaces between words: names are found inside words
const WITHOUT_SPACES =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

const MAX_NAME_WORDS = 4;
const MIN_FORM_LENGTH = 4;
const MIN_FORM_LENGTH_WITHOUT_SPACES = 2;
const MAX_HANDLE_AFFIX_LENGTH = 3;
const MIN_VIDEOS_TO_DETECT_HOSTS = 5;
const MIN_HOST_VIDEOS_RATIO = 0.3;

// Only Latin, Greek and Cyrillic accents are removed: Japanese voiced marks change the kana
export const comparable_form = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(new RegExp(`[^${LETTER}]+`, "gu"), " ")
    .trim();

export const guest_key = (name: string) => comparable_form(name).replaceAll(" ", "");

export function keys_in_query(query: string) {
  const words = comparable_form(query).split(" ").filter(Boolean);
  const keys = new Set<string>();

  for (let start = 0; start < words.length; start++) {
    for (let end = start + 1; end <= Math.min(words.length, start + MAX_NAME_WORDS); end++) {
      keys.add(words.slice(start, end).join(""));
    }
  }

  return [...keys];
}

export function build_known_channels(channels: Array<{ id: string; name: string }>): KnownChannels {
  const by_key = new Map<string, Guest>();
  const forms = [];

  for (const channel of channels) {
    const key = guest_key(channel.name);
    if (key.length < 2 || by_key.has(key)) {
      continue;
    }

    const guest = { key, subscription_id: channel.id };
    by_key.set(key, guest);

    const form = comparable_form(channel.name);
    const without_spaces = WITHOUT_SPACES.test(form);
    if (key.length >= (without_spaces ? MIN_FORM_LENGTH_WITHOUT_SPACES : MIN_FORM_LENGTH)) {
      forms.push({ form, without_spaces, guest });
    }
  }

  return { by_key, forms };
}

function channel_of_handle(key: string, channels: KnownChannels) {
  let found = channels.by_key.get(key);

  for (const guest of found ? [] : channels.by_key.values()) {
    if (
      guest.key.length >= MIN_FORM_LENGTH &&
      key.length - guest.key.length <= MAX_HANDLE_AFFIX_LENGTH &&
      key.includes(guest.key) &&
      (!found || guest.key.length > found.key.length)
    ) {
      found = guest;
    }
  }

  return found;
}

function keys_after_marker(title: string): Array<string> {
  const keys = [];

  for (const match of title.matchAll(RELIABLE_MARKER)) {
    const list = title.slice(match.index + match[0].length).split(LIST_END)[0] ?? "";
    keys.push(...list.split(LIST_SEPARATOR).map(guest_key));
  }

  return keys;
}

function channels_in(title: string, channels: KnownChannels): Array<Guest> {
  const form = comparable_form(title);
  const padded = ` ${form} `;

  return channels.forms
    .filter((candidate) =>
      candidate.without_spaces
        ? form.includes(candidate.form)
        : padded.includes(` ${candidate.form} `),
    )
    .map((candidate) => candidate.guest);
}

export function extract_guests(
  title: string,
  { channels, channel_name }: ExtractGuestsOptions,
): Array<Guest & { recognized: boolean }> {
  const channel_key = channel_name ? guest_key(channel_name) : undefined;
  const guests = new Map<string, Guest & { recognized: boolean }>();

  const is_host = (key: string) =>
    !!channel_key &&
    (key === channel_key ||
      (key.length >= MIN_FORM_LENGTH && channel_key.includes(key)) ||
      (channel_key.length >= MIN_FORM_LENGTH && key.includes(channel_key)));

  const add = (guest: Guest | undefined, recognized = false) => {
    if (guest && !is_host(guest.key) && !guests.has(guest.key)) {
      guests.set(guest.key, { ...guest, recognized });
    }
  };

  for (const match of title.matchAll(HANDLE)) {
    add(channel_of_handle(guest_key(match[1] ?? ""), channels));
  }

  for (const key of keys_after_marker(title)) {
    add(channels.by_key.get(key));
  }

  for (const guest of channels_in(title, channels)) {
    add(guest, true);
  }

  return [...guests.values()];
}

export function extract_channel_guests(
  titles: Array<string>,
  options: ExtractGuestsOptions,
): Array<Array<Guest>> {
  const guests = titles.map((title) => extract_guests(title, options));

  const recognitions = new Map<string, number>();
  for (const guest of guests.flat()) {
    if (guest.recognized) {
      recognitions.set(guest.key, (recognitions.get(guest.key) ?? 0) + 1);
    }
  }

  const hosts = new Set(
    [...recognitions]
      .filter(
        ([, count]) =>
          titles.length >= MIN_VIDEOS_TO_DETECT_HOSTS &&
          count / titles.length >= MIN_HOST_VIDEOS_RATIO,
      )
      .map(([key]) => key),
  );

  return guests.map((video_guests) =>
    video_guests
      .filter((guest) => !(guest.recognized && hosts.has(guest.key)))
      .map(({ key, subscription_id }) => ({ key, subscription_id })),
  );
}
