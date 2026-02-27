import { AbstractService } from "#framework";
import { services } from "#framework/server";
import type { ServiceCredentials, CredentialsType } from "#shared/types/credentials";
import { useDatabase } from "#server/database";
import { isBefore, parseISO } from "date-fns";

export default class CredentialsService extends AbstractService {
  async get(service: CredentialsType, refresh = true): Promise<ServiceCredentials | null> {
    const database = useDatabase();

    const credentials = await database
      .selectFrom("credentials")
      .selectAll()
      .where("service", "=", service)
      .executeTakeFirst();

    if (!credentials) {
      return null;
    }

    const serviceCredentials = {
      service: credentials.service,
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expires_at: credentials.access_token,
      userId: credentials.user_id,
    };

    if (refresh) {
      return this.refresh_if_needed(service, serviceCredentials);
    }

    return serviceCredentials;
  }

  async replace(data: ServiceCredentials) {
    const database = useDatabase();

    const exists = await database
      .selectFrom("credentials")
      .selectAll()
      .where("service", "=", data.service)
      .executeTakeFirst();

    if (exists) {
      await database
        .updateTable("credentials")
        .set({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user_id: data.userId,
        })
        .where("service", "=", exists.service)
        .execute();
    } else {
      await database
        .insertInto("credentials")
        .values({
          service: data.service,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user_id: data.userId,
        })
        .execute();
    }

    return data;
  }

  async refresh_if_needed(
    service: CredentialsType,
    credentials: ServiceCredentials,
  ): Promise<ServiceCredentials> {
    if (isBefore(new Date(), parseISO(credentials.expires_at))) {
      // Token is still valid, do nothing..
      return credentials;
    }

    const callback: Record<CredentialsType, (token: string) => Promise<ServiceCredentials>> = {
      google: (token: string) => services.external.google.oauth.refresh_access_token(token),
      twitch: (token: string) => services.external.twitch.oauth.refresh_access_token(token),
    };

    const handler = callback[service]!;
    const response = await handler(credentials.refresh_token);
    await this.replace(response);

    return response;
  }
}
