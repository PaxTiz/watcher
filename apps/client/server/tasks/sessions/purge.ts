import { sessions } from "@watcher/database";

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
