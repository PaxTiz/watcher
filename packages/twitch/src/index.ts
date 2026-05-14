import { type ClientSettings, TwitchClient } from "./internal/client";

export const createClient = (options: ClientSettings) => {
  return new TwitchClient(options);
};

export type Client = ReturnType<typeof createClient>;
