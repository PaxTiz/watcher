import { ofetch } from "ofetch";

import type { Twitch } from "../../types";
import type { ClientSettings } from "./client";
import type { TwitchServiceRequest } from "./service";

async function get_current_user(settings: ClientSettings, config: TwitchServiceRequest) {
  try {
    const tokens = await get_access_token(settings, config);
    if (!tokens) {
      throw new Error("Could not obtain Twitch credentials");
    }

    const response = await ofetch<Twitch["OAuth"]["User"]>("https://id.twitch.tv/oauth2/userinfo", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    return response;
  } catch (error) {
    throw new Error("Failed to get current Twitch user", { cause: error });
  }
}

function get_access_token(settings: ClientSettings, config: TwitchServiceRequest) {
  return settings.onRequest(config.service_id);
}

async function refresh_access_token(settings: ClientSettings, refresh_token: string) {
  try {
    const response = await ofetch<{
      access_token: string;
      refresh_token: string;
      scope: Array<string>;
      token_type: "bearer";
    }>("https://id.twitch.tv/oauth2/token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      query: {
        grant_type: "refresh_token",
        refresh_token: encodeURI(refresh_token),
        client_id: settings.client_id,
        client_secret: settings.client_secret,
      },
    });

    return response;
  } catch (err) {
    throw new Error("Failed to refresh Twitch access token", { cause: err });
  }
}

export const oauth = {
  get_current_user,
  get_access_token,
  refresh_access_token,
};
