import { credentials } from "@watcher/database";
import { type Client, createClient } from "@watcher/integration-google";

import { decrypt, encrypt } from "../utils/encryption";

let _client: Client | null = null;

export const useGoogle = () => {
  if (!_client) {
    const config = useRuntimeConfig();

    _client = createClient({
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,

      onRequest: async (service_id) => {
        const row = await credentials.find_by_service({ service: "google", service_id });

        if (!row) {
          return null;
        }

        return {
          access_token: decrypt("access_token", row.access_token),
          access_token_expires_at: row.access_token_expires_at,
          refresh_token: decrypt("refresh_token", row.refresh_token),
          refresh_token_expires_at: row.refresh_token_expires_at,
        };
      },

      onRefreshToken: async ({ service_id, tokens }) => {
        await credentials.update_tokens({
          service: "google",
          service_id,
          tokens: {
            access_token: encrypt("access_token", tokens.access_token),
            access_token_expires_at: tokens.access_token_expires_at,
            refresh_token: encrypt("refresh_token", tokens.refresh_token),
            refresh_token_expires_at: tokens.refresh_token_expires_at,
          },
        });

        return tokens;
      },
    });
  }

  return _client;
};
