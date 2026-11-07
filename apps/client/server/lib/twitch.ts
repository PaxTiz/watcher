import { credentials, type DatabaseSchema } from "@watcher/database";
import { type Client, createClient } from "@watcher/integration-twitch";
import { useStorage } from "nitropack/runtime";
import { useRuntimeConfig } from "nuxt/server";

import { decrypt, encrypt } from "#server/utils/encryption";

let _client: Client | null = null;

const storage = useStorage("oauth_tokens");

type StoredTokens = Pick<
  DatabaseSchema["credentials"],
  "access_token" | "access_token_expires_at" | "refresh_token" | "refresh_token_expires_at"
>;

const to_key = (id: string) => `${id}:twitch`;

export const forget_twitch_tokens = (service_id: string) => storage.removeItem(to_key(service_id));

export const useTwitch = () => {
  if (!_client) {
    const config = useRuntimeConfig();

    _client = createClient({
      client_id: config.oauth.twitch.clientId,
      client_secret: config.oauth.twitch.clientSecret,

      onRequest: async (service_id) => {
        const key = to_key(service_id);

        const cached = await storage.get<StoredTokens>(key);
        if (cached) {
          return cached;
        }

        const row = await credentials.find_by_service({
          service: "twitch",
          service_id,
        });

        if (!row) {
          return null;
        }

        const tokens: StoredTokens = {
          access_token: decrypt("access_token", row.access_token),
          access_token_expires_at: row.access_token_expires_at,
          refresh_token: decrypt("refresh_token", row.refresh_token),
          refresh_token_expires_at: row.refresh_token_expires_at,
        };

        await storage.setItem(key, tokens);

        return tokens;
      },

      onRefreshToken: async ({ service_id, tokens }) => {
        const key = to_key(service_id);

        await storage.removeItem(key);

        await credentials.update_tokens({
          service: "twitch",
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
