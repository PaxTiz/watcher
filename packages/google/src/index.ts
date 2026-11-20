import { type ClientSettings, GoogleClient } from "./internal/client";

export { GoogleInvalidGrantError } from "./internal/oauth";
export { to_playlist_id } from "./youtube/playlist_items";

export const createClient = (options: ClientSettings) => {
  return new GoogleClient(options);
};

export type Client = ReturnType<typeof createClient>;
