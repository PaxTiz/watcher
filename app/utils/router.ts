import type { RouteLocationNormalized } from "vue-router";

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
