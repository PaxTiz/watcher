export type Guest = {
  key: string; // identifies a person whatever the way it's written: "@SuperYoutuber", "Super Youtuber"
  name: string;
  subscription_id?: string; // when the guest is a channel known in database
};

export type KnownPerson = Guest;

export type KnownPeople = {
  by_key: ReadonlyMap<string, KnownPerson>;
  // Comparable forms of their names, searched anywhere in titles
  forms: ReadonlyArray<{ form: string; without_spaces: boolean; person: KnownPerson }>;
};

export type ExtractGuestsOptions = {
  people: KnownPeople;
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
const LIST_CLOSERS = new Set([
  "etc",
  "ecc",
  "usw",
  "co",
  "cie",
  "cia",
  "compagnie",
  "company",
  "compania",
  "companhia",
  "compagnia",
  "friends",
  "amis",
  "potes",
  "amigos",
  "amici",
  "freunde",
  "others",
  "autres",
  "otros",
  "altri",
  "more",
  "等",
  "など",
  "他",
  "외",
]);
const LIST_SEPARATOR = new RegExp(
  `\\s*(?:[,&+/、・，＆×]|\\s(?:${CONJUNCTIONS.join("|")})\\s)\\s*`,
  "iu",
);

// Scripts written without spaces between words: names are found inside words
const WITHOUT_SPACES =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

const MAX_NAME_LENGTH = 40;
const MAX_NAME_WORDS = 4;
const MIN_FORM_LENGTH = 4;
const MIN_FORM_LENGTH_WITHOUT_SPACES = 2;
const MIN_VIDEOS_TO_BE_KNOWN = 2;
const MAX_HANDLE_AFFIX_LENGTH = 3;
const MAX_ACRONYM_LENGTH = 3;
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

const has_mixed_case = (name: string) => name !== name.toLowerCase() && name !== name.toUpperCase();

// "AMEL BENT" → "Amel Bent", acronyms ("JDG") kept. No-op for scripts without case.
const prettify = (name: string) =>
  name !== name.toUpperCase() || name === name.toLowerCase()
    ? name
    : name.replace(new RegExp(`[${LETTER}]+`, "gu"), (word) =>
        word.length <= MAX_ACRONYM_LENGTH ? word : word[0] + word.slice(1).toLowerCase(),
      );

const clean_name = (value: string) =>
  value.replace(new RegExp(`^[^${LETTER}@]+|[^${LETTER}]+$`, "gu"), "").replace(/^@/, "");

const is_name = (name: string) =>
  name.length >= 2 &&
  name.length <= MAX_NAME_LENGTH &&
  name.split(/\s+/).length <= MAX_NAME_WORDS &&
  (!/\s/.test(name) || !/^\p{Ll}/u.test(name)) &&
  !LIST_CLOSERS.has(comparable_form(name)) &&
  new RegExp(`[${LETTER}]`, "u").test(name);

export function preferred_name(names: Array<{ name: string; count: number }>) {
  return names.toSorted(
    (a, b) =>
      b.count - a.count ||
      Number(has_mixed_case(b.name)) - Number(has_mixed_case(a.name)) ||
      a.name.localeCompare(b.name),
  )[0]?.name;
}

export function build_known_people({
  channels,
  guests,
}: {
  channels: Array<{ id: string; name: string }>;
  guests: Array<{ key: string; name: string; videos_count: number }>;
}): KnownPeople {
  const by_key = new Map<string, KnownPerson>();
  const names_by_key = new Map<string, Array<{ name: string; count: number }>>();

  for (const guest of guests) {
    const names = names_by_key.get(guest.key) ?? [];
    names.push({ name: guest.name, count: guest.videos_count });
    names_by_key.set(guest.key, names);
  }

  for (const [key, names] of names_by_key) {
    const videos_count = names.reduce((total, name) => total + name.count, 0);
    if (videos_count >= MIN_VIDEOS_TO_BE_KNOWN) {
      by_key.set(key, { key, name: prettify(preferred_name(names)!) });
    }
  }

  for (const channel of channels) {
    const key = guest_key(channel.name);
    if (key.length >= 2) {
      by_key.set(key, { key, name: channel.name, subscription_id: channel.id });
    }
  }

  const forms = [];
  for (const person of by_key.values()) {
    const names = [person.name, ...(names_by_key.get(person.key) ?? []).map(({ name }) => name)];

    for (const form of new Set(names.map(comparable_form))) {
      const without_spaces = WITHOUT_SPACES.test(form);
      const length = form.replaceAll(" ", "").length;

      if (length >= (without_spaces ? MIN_FORM_LENGTH_WITHOUT_SPACES : MIN_FORM_LENGTH)) {
        forms.push({ form, without_spaces, person });
      }
    }
  }

  return { by_key, forms };
}

function person_of_handle(key: string, people: KnownPeople) {
  let found: KnownPerson | undefined;

  for (const person of people.by_key.values()) {
    if (
      person.key.length >= MIN_FORM_LENGTH &&
      key.length - person.key.length <= MAX_HANDLE_AFFIX_LENGTH &&
      key.includes(person.key) &&
      (!found || person.key.length > found.key.length)
    ) {
      found = person;
    }
  }

  return found;
}

function names_after_marker(title: string): Array<string> {
  const names = [];

  for (const match of title.matchAll(RELIABLE_MARKER)) {
    const list = title.slice(match.index + match[0].length).split(LIST_END)[0] ?? "";
    names.push(...list.split(LIST_SEPARATOR).map(clean_name));
  }

  return names;
}

function known_people_in(title: string, people: KnownPeople): Array<KnownPerson> {
  const form = comparable_form(title);
  const padded = ` ${form} `;

  return people.forms
    .filter((candidate) =>
      candidate.without_spaces
        ? form.includes(candidate.form)
        : padded.includes(` ${candidate.form} `),
    )
    .map((candidate) => candidate.person);
}

export function extract_guests(
  title: string,
  { people, channel_name }: ExtractGuestsOptions,
): Array<Guest & { recognized: boolean }> {
  const channel_key = channel_name ? guest_key(channel_name) : undefined;
  const guests = new Map<string, Guest & { recognized: boolean }>();

  const is_host = (key: string) =>
    !!channel_key &&
    (key === channel_key ||
      (key.length >= MIN_FORM_LENGTH && channel_key.includes(key)) ||
      (channel_key.length >= MIN_FORM_LENGTH && key.includes(channel_key)));

  const add = (guest: Guest, recognized = false) => {
    if (guest.key.length >= 2 && !is_host(guest.key) && !guests.has(guest.key)) {
      guests.set(guest.key, { ...guest, recognized });
    }
  };

  for (const match of title.matchAll(HANDLE)) {
    const handle = clean_name(match[1] ?? "");
    const key = guest_key(handle);

    if (is_name(handle)) {
      add(people.by_key.get(key) ?? person_of_handle(key, people) ?? { key, name: handle });
    }
  }

  for (const name of names_after_marker(title)) {
    const key = guest_key(name);

    if (is_name(name)) {
      add(people.by_key.get(key) ?? { key, name: prettify(name) });
    }
  }

  for (const person of known_people_in(title, people)) {
    add(person, true);
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
      .map(({ key, name, subscription_id }) => ({ key, name, subscription_id })),
  );
}
