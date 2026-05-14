import { isBefore } from "date-fns";

import { AbstractService } from "#framework";
import { services } from "#framework/server";
import { useDatabase } from "#server/database";
import type { ServiceCredentials, CredentialsType } from "#shared/types/credentials";

export default class CredentialsService extends AbstractService {
  async get(
    user_id: string,
    service: CredentialsType,
    refresh = true,
  ): Promise<ServiceCredentials | null> {
    const database = useDatabase();

    const credentials = await database
      .selectFrom("credentials")
      .selectAll()
      .where("service", "=", service)
      .where("user_id", "=", user_id)
      .executeTakeFirst();

    if (!credentials) {
      return null;
    }

    const serviceCredentials: ServiceCredentials = {
      service: credentials.service,
      service_id: credentials.service_id,
      access_token: credentials.access_token,
      access_token_expires_at: credentials.access_token_expires_at,
      refresh_token: credentials.refresh_token,
      refresh_token_expires_at: credentials.refresh_token_expires_at,
      userId: credentials.user_id,
    };

    if (refresh) {
      return this.refresh_if_needed(user_id, service, serviceCredentials);
    }

    return serviceCredentials;
  }

  async replace(user_id: string, data: ServiceCredentials) {
    const database = useDatabase();

    // TODO: Data encryption for tokens

    await database
      .insertInto("credentials")
      .values({
        service: data.service,
        service_id: data.userId,
        access_token: data.access_token,
        access_token_expires_at: data.access_token_expires_at,
        refresh_token: data.refresh_token,
        refresh_token_expires_at: data.refresh_token_expires_at,
        user_id,
      })
      .onConflict((oc) =>
        oc.columns(["service", "user_id"]).doUpdateSet({
          access_token: data.access_token,
          access_token_expires_at: data.access_token_expires_at,
          refresh_token: data.refresh_token,
          refresh_token_expires_at: data.refresh_token_expires_at,
        }),
      )
      .execute();

    return data;
  }

  async refresh_if_needed(
    user_id: string,
    service: CredentialsType,
    credentials: ServiceCredentials,
  ): Promise<ServiceCredentials> {
    if (isBefore(new Date(), credentials.access_token_expires_at)) {
      // Token is still valid, do nothing..
      return credentials;
    }

    const callback: Record<
      CredentialsType,
      ((token: string) => Promise<ServiceCredentials>) | null
    > = {
      google: (token: string) => services.external.google.oauth.refresh_access_token(token),
      twitch: null,
    };

    const handler = callback[service];
    if (!handler) {
      throw new Error("Refresh token handler not available for " + service);
    }

    const response = await handler(credentials.refresh_token);
    await this.replace(user_id, response);

    return response;
  }
}
