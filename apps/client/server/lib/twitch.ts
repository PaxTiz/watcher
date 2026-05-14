import { type Client, createClient } from "@watcher/integration-twitch";

import { useDatabase } from "#server/database";

let _client: Client | null = null;

export const useTwitch = () => {
  if (!_client) {
    const config = useRuntimeConfig();

    _client = createClient({
      client_id: config.oauth.twitch.clientId,
      client_secret: config.oauth.twitch.clientSecret,

      onRequest: async (service_id) => {
        const database = useDatabase();

        const credentials = await database
          .selectFrom("credentials")
          .selectAll()
          .where("service", "=", "twitch")
          .where("service_id", "=", service_id)
          .executeTakeFirst();

        if (!credentials) {
          return null;
        }

        return {
          access_token: credentials.access_token,
          access_token_expires_at: credentials.access_token_expires_at,
          refresh_token: credentials.refresh_token,
          refresh_token_expires_at: credentials.refresh_token_expires_at,
        };
      },

      onRefreshToken: async ({ service_id, tokens }) => {
        const database = useDatabase();

        await database
          .updateTable("credentials")
          .set({
            access_token: tokens.access_token,
            access_token_expires_at: tokens.access_token_expires_at,
            refresh_token: tokens.refresh_token,
            refresh_token_expires_at: tokens.refresh_token_expires_at,
          })
          .where("service", "=", "twitch")
          .where("service_id", "=", service_id)
          .execute();

        return tokens;
      },
    });
  }

  return _client;
};
