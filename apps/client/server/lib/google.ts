import { credentials, type DatabaseSchema } from "@watcher/database";
import { type Client, createClient } from "@watcher/integration-google";
import { differenceInSeconds } from "date-fns";
import { useStorage } from "nitropack/runtime";
import { useRuntimeConfig } from "nuxt/server";

import { decrypt, encrypt } from "#server/utils/encryption";

let _client: Client | null = null;

const storage = useStorage("oauth_tokens");

const to_key = (id: string) => `${id}:youtube`;

export const forget_google_tokens = (service_id: string) => storage.removeItem(to_key(service_id));

export const useGoogle = () => {
  if (!_client) {
    const config = useRuntimeConfig();

    _client = createClient({
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,

      onRequest: async (service_id) => {
        const key = to_key(service_id);
        let tokens: DatabaseSchema["credentials"] | null | undefined;

        const isCached = await storage.has(key);
        if (isCached) {
          tokens = await storage.get<DatabaseSchema["credentials"]>(key);
        } else {
          tokens = await credentials.find_by_service({
            service: "google",
            service_id,
          });
        }

        if (!tokens) {
          return null;
        }

        if (!isCached) {
          await storage.setItem(key, tokens, {
            ttl: differenceInSeconds(tokens.access_token_expires_at, new Date()),
          });
        }

        return {
          access_token: decrypt("access_token", tokens.access_token),
          access_token_expires_at: tokens.access_token_expires_at,
          refresh_token: decrypt("refresh_token", tokens.refresh_token),
          refresh_token_expires_at: tokens.refresh_token_expires_at,
        };
      },

      onRefreshToken: async ({ service_id, tokens }) => {
        const key = to_key(service_id);

        await storage.removeItem(key);

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
