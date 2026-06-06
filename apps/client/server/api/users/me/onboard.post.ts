import { z } from "zod/mini";

import { defineRoute } from "#framework";
import { services } from "#framework/server";
import { booleanSchema } from "#shared/validators/shared";

export default defineRoute({
  body: z.object({
    sync: booleanSchema,
  }),

  async handler(event, { body }) {
    const { user } = await requireUserSession(event);

    const { user: onboarded_user } = await services.users.onboard(user, body.sync);

    await set_user_session(event, onboarded_user, onboarded_user.login_with);
  },
});
