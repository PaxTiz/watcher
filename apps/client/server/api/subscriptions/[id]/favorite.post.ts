import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";

export default defineRoute({
  params: z.object({
    id: z.uuidv7(),
  }),

  async handler(event, { params }) {
    const { user } = await requireUserSession(event);

    await services.subscriptions.toggle_favorite(user, params.id);
  },
});
