const DAY = 24 * 60 * 60 * 1000;

const in_minutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

// ±10%, so that channels checked together drift apart
const with_jitter = (minutes: number) => minutes * (0.9 + Math.random() * 0.2);

// The less a channel publishes, the less often it's checked
export const next_check_at = (last_video_at: string | null) => {
  const age = last_video_at ? Date.now() - new Date(last_video_at).getTime() : Infinity;

  if (age < 2 * DAY) {
    return in_minutes(30 + Math.random() * 30);
  }

  if (age < 30 * DAY) {
    return in_minutes(with_jitter(3 * 60));
  }

  if (age < 182 * DAY) {
    return in_minutes(with_jitter(12 * 60));
  }

  return in_minutes(with_jitter(24 * 60));
};

export const retry_at = (failures: number) => in_minutes(Math.min(15 * 2 ** failures, 24 * 60));

export const latest_date = (dates: Array<string | null>) =>
  dates.reduce<string | null>(
    (latest, date) => (date && (!latest || new Date(date) > new Date(latest)) ? date : latest),
    null,
  );
