import { request_options } from "@watcher/common";
import type { FetchContext, FetchOptions } from "ofetch";

import type { TwitchClient } from "./client";

const MAX_RATE_LIMIT_WAIT = 60_000;

const rate_limit_wait = (context: FetchContext) => {
  const reset = Number(context.response?.headers.get("ratelimit-reset"));

  return Math.min(Math.max(reset * 1000 - Date.now(), 1000), MAX_RATE_LIMIT_WAIT);
};

export const helix_options = (
  client: TwitchClient,
  token: string,
  { app = false }: { app?: boolean } = {},
) => {
  const base = request_options();

  return {
    ...base,
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": client.settings.client_id,
    },
    retryDelay: (context) =>
      context.response?.status === 429 ? rate_limit_wait(context) : base.retryDelay(context),
    onResponse: ({ response }) => {
      if (app) {
        client.record_rate_limit(response.headers);
      }
    },
  } satisfies FetchOptions;
};
