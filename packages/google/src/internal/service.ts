import { add, isBefore } from "date-fns";

import type { ClientTokens, GoogleClient } from "./client";
import { oauth } from "./oauth";

export type GoogleServiceRequest = {
  service_id: string;
};

const pending_refreshes = new Map<string, Promise<ClientTokens>>();

export class GoogleService {
  constructor(protected client: GoogleClient) {}

  protected async perform_request<T>(
    user_id: string,
    callback: (access_token: string) => Promise<T>,
  ) {
    const token = await this.refresh_token_if_needed(user_id);

    return await callback(token.access_token);
  }

  private async refresh_token_if_needed(service_id: string) {
    const credentials = await this.client.settings.onRequest(service_id);
    if (!credentials) {
      throw new Error("User session has expired");
    }

    const thresoldDate = add(new Date(), { minutes: 1 });
    if (isBefore(thresoldDate, credentials.access_token_expires_at)) {
      return credentials;
    }

    let pending = pending_refreshes.get(service_id);
    if (!pending) {
      pending = this.refresh_token(service_id, credentials).finally(() =>
        pending_refreshes.delete(service_id),
      );

      pending_refreshes.set(service_id, pending);
    }

    return pending;
  }

  private async refresh_token(service_id: string, credentials: ClientTokens) {
    const updated_credentials = await oauth.refresh_access_token(
      this.client.settings,
      credentials.refresh_token,
    );

    const patched_credentials = {
      ...credentials,
      access_token: updated_credentials.access_token,
      access_token_expires_at: add(new Date(), { seconds: updated_credentials.expires_in }),
      refresh_token: credentials.refresh_token,
    };

    await this.client.settings.onRefreshToken({
      tokens: patched_credentials,
      service_id,
    });

    return patched_credentials;
  }
}
