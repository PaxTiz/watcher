const DAY = 24 * 60 * 60 * 1000;

const in_minutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const with_jitter = (minutes: number, ratio = 0.1) =>
  minutes * (1 - ratio + Math.random() * 2 * ratio);

type Ladder = Array<[number, number, number?]>;

const FEEDS: Ladder = [
  [2, 45, 1 / 3],
  [30, 3 * 60],
  [182, 12 * 60],
  [Infinity, 24 * 60],
];

const LIVES: Ladder = [
  [2, 10],
  [30, 30],
  [182, 6 * 60],
  [Infinity, 24 * 60],
];

const VODS: Ladder = [
  [2, 24 * 60],
  [30, 3 * 24 * 60],
  [Infinity, 5 * 24 * 60],
];

// The less a channel publishes, the less often it's checked
const interval = (ladder: Ladder, last_video_at: string | null) => {
  const age = last_video_at ? Date.now() - new Date(last_video_at).getTime() : Infinity;
  const [, minutes, ratio] = ladder.find(([days]) => age < days * DAY) ?? ladder.at(-1)!;

  return with_jitter(minutes, ratio);
};

export const next_check_at = (last_video_at: string | null, websub_expires_at: string | null) => {
  const websub_active = !!websub_expires_at && new Date(websub_expires_at).getTime() > Date.now();
  const minutes = interval(FEEDS, last_video_at);

  return in_minutes(websub_active ? Math.max(minutes, with_jitter(3 * 60)) : minutes);
};

export const next_live_check_at = (last_video_at: string | null, live: boolean) =>
  in_minutes(live ? with_jitter(5) : interval(LIVES, last_video_at));

export const next_vods_read_at = (last_video_at: string | null) =>
  in_minutes(interval(VODS, last_video_at));

export const next_subscriptions_sync_at = () => in_minutes(with_jitter(24 * 60));

export const retry_at = (failures: number) => in_minutes(Math.min(15 * 2 ** failures, 24 * 60));

export const latest_date = (dates: Array<string | null>) =>
  dates.reduce<string | null>(
    (latest, date) => (date && (!latest || new Date(date) > new Date(latest)) ? date : latest),
    null,
  );
