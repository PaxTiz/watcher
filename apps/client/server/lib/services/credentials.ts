import type { CredentialsType, ServiceCredentials } from "@watcher/common";
import { credentials, type DatabaseSchema } from "@watcher/database";

import { AbstractService } from "#framework";

export default class CredentialsService extends AbstractService {
  async get(user_id: string, service: CredentialsType): Promise<ServiceCredentials | null> {
    const row = await credentials.find_by_user({ user_id, service });

    return row ? this.to_service_credentials(row) : null;
  }

  async find_by_service(
    service: CredentialsType,
    service_id: string,
  ): Promise<ServiceCredentials | null> {
    const row = await credentials.find_by_service({ service, service_id });

    return row ? this.to_service_credentials(row) : null;
  }

  async replace(user_id: string, data: ServiceCredentials) {
    await credentials.upsert({
      data: {
        service: data.service,
        service_id: data.service_id,
        access_token: encrypt("access_token", data.access_token),
        access_token_expires_at: data.access_token_expires_at,
        refresh_token: encrypt("refresh_token", data.refresh_token),
        refresh_token_expires_at: data.refresh_token_expires_at,
        user_id,
      },
    });

    return data;
  }

  async delete(user_id: string, service: CredentialsType) {
    await credentials.remove({ user_id, service });
  }

  private to_service_credentials(row: DatabaseSchema["credentials"]): ServiceCredentials {
    return {
      service: row.service,
      service_id: row.service_id,
      access_token: decrypt("access_token", row.access_token),
      access_token_expires_at: row.access_token_expires_at,
      refresh_token: decrypt("refresh_token", row.refresh_token),
      refresh_token_expires_at: row.refresh_token_expires_at,
      userId: row.user_id,
    };
  }
}
