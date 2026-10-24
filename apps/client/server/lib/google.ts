import { credentials, type DatabaseSchema } from "@watcher/database";
import { type Client, createClient } from "@watcher/integration-google";
import { differenceInSeconds } from "date-fns";

import type { User } from "#auth-utils";

import { decrypt, encrypt } from "../utils/encryption";

let _client: Client | null = null;

const storage = useStorage("tokens");

export const useGoogle = (user: User) => {
  if (!_client) {
    const config = useRuntimeConfig();

    _client = createClient({
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,

      onRequest: async (service_id) => {
        let tokens: DatabaseSchema["credentials"] | null | undefined;

        const key = `${user.id}:youtube`;
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
            ttl: differenceInSeconds(new Date(), tokens.access_token_expires_at),
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
        await credentials.update_tokens({
          user_id: user.id,
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
