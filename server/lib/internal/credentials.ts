import type { ServiceCredentials, CredentialsType } from "#shared/types/credentials";
import { useDatabase } from "#server/database";
import { external } from "../external";
import { isBefore, parseISO } from "date-fns";

export default class CredentialsService {
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
    };

    if (refresh) {
      return this.refresh_if_needed("google", serviceCredentials);
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
        })
        .where("id", "=", exists.id)
        .execute();
    } else {
      await database
        .insertInto("credentials")
        .values({
          service: data.service,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
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

    const callback: Record<
      CredentialsType,
      ((token: string) => Promise<ServiceCredentials>) | undefined
    > = {
      google: external.google.oauth.refresh_access_token,
      // TODO: Implement `Twitch` refresh token
      twitch: undefined,
    };

    const handler = callback[service]!;
    const response = await handler(credentials.refresh_token);
    await this.replace(response);

    return response;
  }
}
