import { type ClientSettings, TwitchClient } from "./internal/client";

export const createClient = (options: ClientSettings) => {
  return new TwitchClient(options);
};

export type Client = ReturnType<typeof createClient>;

export type { RateLimit } from "./internal/client";
export { MAX_STREAMS_PER_REQUEST } from "./streams";
export { MAX_VIDEOS_PER_REQUEST } from "./videos";
