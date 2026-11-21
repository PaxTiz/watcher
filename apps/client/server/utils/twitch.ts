import { IMAGE_SIZES } from "#server/utils/images";

export const twitch_thumbnail_url = (template: string, size: "small" | "large") =>
  template
    .replace("%{width}", IMAGE_SIZES[size].width.toString())
    .replace("%{height}", IMAGE_SIZES[size].height.toString());

export const is_twitch_placeholder_thumbnail = (template: string) =>
  !template || template.includes("/_404/");

export const twitch_duration_seconds = (duration: string) => {
  const match = duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!match?.[0]) {
    return 0;
  }

  const [hours, minutes, seconds] = [match[1], match[2], match[3]].map((part) =>
    parseInt(part ?? "0", 10),
  );

  return hours! * 3600 + minutes! * 60 + seconds!;
};
