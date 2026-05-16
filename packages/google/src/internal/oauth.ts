import type { Google } from "@watcher/types";
import { ofetch } from "ofetch";

import type { ClientSettings } from "./client";
import type { GoogleServiceRequest } from "./service";

async function get_current_user(settings: ClientSettings, config: GoogleServiceRequest) {
  try {
    const tokens = await get_access_token(settings, config);
    if (!tokens) {
      throw new Error("Could not obtain Google credentials");
    }

    const response = await ofetch<Google["OAuth"]["User"]>(
      `https://www.googleapis.com/oauth2/v1/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    return response;
  } catch (error) {
    throw new Error("Failed to get current Google user", { cause: error });
  }
}

function get_access_token(settings: ClientSettings, config: GoogleServiceRequest) {
  return settings.onRequest(config.service_id);
}

async function refresh_access_token(settings: ClientSettings, refresh_token: string) {
  try {
    const response = await ofetch<{
      access_token: string;
      expires_in: number;
      scope: Array<string>;
      token_type: "Bearer";
    }>("https://oauth2.googleapis.com/token", {
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
    throw new Error("Failed to refresh Google access token", { cause: err });
  }
}

export const oauth = {
  get_current_user,
  get_access_token,
  refresh_access_token,
};
