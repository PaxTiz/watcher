import slugify from "slugify";

import type { CredentialsType, ServiceType } from "#shared/types/credentials";

export const to_subscription_slug = <T extends CredentialsType>(
  service: ServiceType<T>,
  service_name: string,
) => {
  const slug = slugify(service_name, {
    locale: "fr",
    lower: true,
    strict: true,
    trim: true,
  });

  return `${service}/${slug}`;
};
