export const useMeta = (values: {
  title: string | (() => string);
  description?: string | (() => string);
}) => {
  const { t } = useNuxtApp().$i18n;
  const description = values.description ?? (() => t("meta.description"));

  useSeoMeta({
    title: values.title,
    ogTitle: values.title,
    description: description,
    ogDescription: description,
    robots: {
      noindex: true,
      nofollow: true,
    },
  });
};
