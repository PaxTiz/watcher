import { sessions } from "@watcher/database";
import { defineTask } from "nitropack/runtime";

export default defineTask({
  meta: {
    name: "sessions:purge",
    description: "Delete the expired sessions",
  },

  async run() {
    const deleted = await sessions.remove_expired();

    return { result: { deleted } };
  },
});
