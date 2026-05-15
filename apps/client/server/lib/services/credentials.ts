import { AbstractService } from "#framework";
import { useDatabase } from "#server/database";
import type { CredentialsType, ServiceCredentials } from "#shared/types/credentials";

export default class CredentialsService extends AbstractService {
  async get(user_id: string, service: CredentialsType): Promise<ServiceCredentials | null> {
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

    return {
      service: credentials.service,
      service_id: credentials.service_id,
      access_token: credentials.access_token,
      access_token_expires_at: credentials.access_token_expires_at,
      refresh_token: credentials.refresh_token,
      refresh_token_expires_at: credentials.refresh_token_expires_at,
      userId: credentials.user_id,
    } as ServiceCredentials;
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
}
