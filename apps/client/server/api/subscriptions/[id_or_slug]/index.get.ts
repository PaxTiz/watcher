import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  params: z.object({
    id_or_slug: z.string(),
  }),

  async handler(event, { params }) {
    const { user } = await requireUserSession(event);

    return services.subscriptions.find_one(user, params.id_or_slug);
  },
});
