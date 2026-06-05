export const useMeta = (values: {
  title: string | (() => string);
  description?: string | (() => string);
}) => {
  const description =
    values.description ?? "Watcher - Suivez tous vos créateurs favoris au même endroit";

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
