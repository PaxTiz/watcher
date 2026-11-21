const DAY = 24 * 60 * 60 * 1000;

const in_minutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

// ±10%, so that channels checked together drift apart
const with_jitter = (minutes: number) => minutes * (0.9 + Math.random() * 0.2);

// The less a channel publishes, the less often it's checked
const check_interval = (last_video_at: string | null) => {
  const age = last_video_at ? Date.now() - new Date(last_video_at).getTime() : Infinity;

  if (age < 2 * DAY) {
    return 30 + Math.random() * 30;
  }

  if (age < 30 * DAY) {
    return with_jitter(3 * 60);
  }

  if (age < 182 * DAY) {
    return with_jitter(12 * 60);
  }

  return with_jitter(24 * 60);
};

export const next_check_at = (last_video_at: string | null, websub_expires_at: string | null) => {
  const websub_active = !!websub_expires_at && new Date(websub_expires_at).getTime() > Date.now();
  const interval = check_interval(last_video_at);

  return in_minutes(websub_active ? Math.max(interval, with_jitter(3 * 60)) : interval);
};

export const next_live_check_at = (last_video_at: string | null, live: boolean) => {
  if (live) {
    return in_minutes(with_jitter(5));
  }

  const age = last_video_at ? Date.now() - new Date(last_video_at).getTime() : Infinity;

  if (age < 2 * DAY) {
    return in_minutes(with_jitter(10));
  }

  if (age < 30 * DAY) {
    return in_minutes(with_jitter(30));
  }

  if (age < 182 * DAY) {
    return in_minutes(with_jitter(6 * 60));
  }

  return in_minutes(with_jitter(24 * 60));
};

export const next_vods_read_at = (last_video_at: string | null) => {
  const age = last_video_at ? Date.now() - new Date(last_video_at).getTime() : Infinity;

  if (age < 2 * DAY) {
    return in_minutes(with_jitter(24 * 60));
  }

  if (age < 30 * DAY) {
    return in_minutes(with_jitter(3 * 24 * 60));
  }

  if (age < 182 * DAY) {
    return in_minutes(with_jitter(7 * 24 * 60));
  }

  return in_minutes(with_jitter(30 * 24 * 60));
};

export const next_subscriptions_sync_at = () => in_minutes(with_jitter(24 * 60));

export const retry_at = (failures: number) => in_minutes(Math.min(15 * 2 ** failures, 24 * 60));

export const latest_date = (dates: Array<string | null>) =>
  dates.reduce<string | null>(
    (latest, date) => (date && (!latest || new Date(date) > new Date(latest)) ? date : latest),
    null,
  );
