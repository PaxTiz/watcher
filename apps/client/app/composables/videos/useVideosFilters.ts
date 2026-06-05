import type { VideosValidators } from "#shared/validators/videos";

export type VideoFilters = VideosValidators["list"]["query"];
export type VideoFilterTypeInclusive = keyof VideoFilters;

export type VideoFilterType =
  | "service"
  | "duration"
  | "date"
  | "subscription_id"
  | "is_favorite"
  | "query";
export type VideoFilterEmit = {
  type: VideoFilterType;
  value: VideosValidators["list"]["query"][VideoFilterType];
};

const stringify_filters = (filters: VideoFilters) => {
  const patched: Record<string, string> = {};

  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined) {
      patched[k] = v.toString();
    }
  }

  return patched;
};

const detect_changed_property = (
  new_value: VideoFilters,
  old_value: VideoFilters,
): VideoFilterTypeInclusive | undefined => {
  for (const property in new_value) {
    const p = property as VideoFilterType;

    if (new_value[p] !== old_value[p]) {
      return p;
    }
  }
};

export const useVideosFilters = (
  base?: Partial<VideoFilters>,
  ignored_properties?: Array<VideoFilterTypeInclusive>,
) => {
  const router = useRouter();

  const filters = ref<VideoFilters>({
    service: base?.service,
    duration: base?.duration,
    date: base?.date,
    subscription_id: base?.subscription_id,
    is_favorite: base?.is_favorite,
    query: base?.query,
    page: base?.page ?? 1,
    per_page: base?.per_page ?? 21,
  });

  watchImmediate(
    () => ({ ...filters.value }),
    async (new_value, old_value) => {
      if (!old_value) {
        return;
      }

      const changed_property = detect_changed_property(new_value, old_value);
      if (!changed_property) {
        return;
      }

      if (ignored_properties && ignored_properties.includes(changed_property)) {
        return;
      }

      if (changed_property !== "page") {
        filters.value.page = 1;
        new_value.page = 1;
      }

      await router.replace({
        query: stringify_filters(new_value),
      });

      if (changed_property === "page" && import.meta.client) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
  );

  return {
    filters,
  };
};
