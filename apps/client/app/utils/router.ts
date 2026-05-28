import type { RouteLocationNormalized } from "vue-router";

export const pages = {
  home: "home",
  videos_index: "videos_index",
} as const;

export const get_number_query_var = async (
  route: RouteLocationNormalized,
  name: string,
  defaultValue = 1,
) => {
  const value = route.query[name];
  if (!value) {
    return defaultValue;
  }

  if (!/\d+/.test(value as string)) {
    await navigateTo({
      ...route,
      query: { [name]: 1 },
    });

    return defaultValue;
  }

  return Number(value);
};
