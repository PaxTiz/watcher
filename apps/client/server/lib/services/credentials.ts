import type { CredentialsType, ServiceCredentials } from "@watcher/common";
import { credentials, type DatabaseSchema } from "@watcher/database";

import { AbstractService, useLogger } from "#framework";
import { forget_google_tokens, useGoogle } from "#server/lib/google";
import { forget_twitch_tokens, useTwitch } from "#server/lib/twitch";
import { decrypt, encrypt } from "#server/utils/encryption";

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
    const credential = await this.get(user_id, service);
    if (!credential) {
      return;
    }

    await this.revoke(credential);
    await credentials.remove({ user_id, service });
  }

  async revoke_all(user_id: string) {
    const rows = await credentials.find_all_by_user({ user_id });

    for (const { service } of rows) {
      const credential = await this.get(user_id, service);
      if (credential) {
        await this.revoke(credential);
      }
    }
  }

  private async revoke(credential: ServiceCredentials) {
    try {
      const client = credential.service === "google" ? useGoogle() : useTwitch();
      await client.revoke(credential);
    } catch (error) {
      useLogger("services.credentials.revoke").warn(
        { service: credential.service, message: (error as Error).message },
        "Failed to revoke the provider tokens",
      );
    } finally {
      const method = credential.service === "google" ? forget_google_tokens : forget_twitch_tokens;
      await method(credential.service_id);
    }
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
