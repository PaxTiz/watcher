import { isBefore, sub } from "date-fns";

import type { ClientSettings } from "./client";
import { oauth } from "./oauth";

export type TwitchServiceRequest = {
  service_id: string;
};

export class TwitchService {
  constructor(protected settings: ClientSettings) {}

  protected async perform_request<T>(
    user_id: string,
    callback: (access_token: string) => Promise<T>,
  ) {
    const token = await this.refresh_token_if_needed(user_id);

    return await callback(token.access_token);
  }

  private async refresh_token_if_needed(service_id: string) {
    const credentials = await this.settings.onRequest(service_id);
    if (!credentials) {
      throw new Error("User session has expired");
    }

    const thresoldDate = sub(new Date(), { minutes: 1 });
    if (isBefore(thresoldDate, credentials.access_token_expires_at)) {
      return credentials;
    }

    const updated_credentials = await oauth.refresh_access_token(
      this.settings,
      credentials.refresh_token,
    );

    const patched_credentials = {
      ...credentials,
      access_token: updated_credentials.access_token,
      refresh_token: updated_credentials.refresh_token,
    };

    await this.settings.onRefreshToken({
      tokens: patched_credentials,
      service_id,
    });

    return patched_credentials;
  }
}
