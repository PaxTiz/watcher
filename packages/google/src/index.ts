import { type ClientSettings, GoogleClient } from "./internal/client";

export const createClient = (options: ClientSettings) => {
  return new GoogleClient(options);
};

export type Client = ReturnType<typeof createClient>;
