import { type Client, createClient } from "@watcher/integration-google";

import { useDatabase } from "#server/database";

import { decrypt, encrypt } from "../utils/encryption";

let _client: Client | null = null;

export const useGoogle = () => {
  if (!_client) {
    const config = useRuntimeConfig();

    _client = createClient({
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,

      onRequest: async (service_id) => {
        const database = useDatabase();

        const credentials = await database
          .selectFrom("credentials")
          .selectAll()
          .where("service", "=", "google")
          .where("service_id", "=", service_id)
          .executeTakeFirst();

        if (!credentials) {
          return null;
        }

        return {
          access_token: decrypt("access_token", credentials.access_token),
          access_token_expires_at: credentials.access_token_expires_at,
          refresh_token: decrypt("refresh_token", credentials.refresh_token),
          refresh_token_expires_at: credentials.refresh_token_expires_at,
        };
      },

      onRefreshToken: async ({ service_id, tokens }) => {
        const database = useDatabase();

        await database
          .updateTable("credentials")
          .set({
            access_token: encrypt("access_token", tokens.access_token),
            access_token_expires_at: tokens.access_token_expires_at,
            refresh_token: encrypt("refresh_token", tokens.refresh_token),
            refresh_token_expires_at: tokens.refresh_token_expires_at,
          })
          .where("service", "=", "google")
          .where("service_id", "=", service_id)
          .execute();

        return tokens;
      },
    });
  }

  return _client;
};
