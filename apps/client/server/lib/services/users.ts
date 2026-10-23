import { type CredentialsType, ForbiddenError, type UserResource } from "@watcher/common";
import { credentials, repositoryTypes, users } from "@watcher/database";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";
import { services } from "#framework/server";

export default class UsersService extends AbstractService {
  async find_by_service_id({
    type,
    id,
  }: {
    type: CredentialsType;
    id: string;
  }): Promise<UserResource | null> {
    const user = await users.find_by_credential({ service: type, service_id: id });

    if (!user) {
      return null;
    }

    return this.find_by_id(user.id);
  }

  async find_by_id(id: string): Promise<UserResource | null> {
    const user = await users.find_by_id({ id });

    if (!user) {
      return null;
    }

    const integrations = await credentials.find_all_by_user({ user_id: id });

    return {
      id: user.id,
      name: user.name,
      integrations: {
        google: integrations.find((c) => c.service === "google")?.service_id ?? null,
        twitch: integrations.find((c) => c.service === "twitch")?.service_id ?? null,
      },
      is_onboarded: user.is_onboarded,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    };
  }

  async create(data: repositoryTypes.users.CreateData): Promise<UserResource> {
    const user = await users.create({ data });

    return (await this.find_by_id(user.id))!;
  }

  async update(id: string, data: repositoryTypes.users.UpdateData) {
    await users.update({ id, data });

    return (await this.find_by_id(id))!;
  }

  async delete(id: string) {
    await users.remove({ id });
  }

  async onboard(user: User, sync: boolean) {
    if (user.is_onboarded) {
      throw new ForbiddenError({ message: "user_is_already_onboarded" });
    }

    if (sync) {
      await services.subscriptions.sync(user);
    }

    await users.mark_as_onboarded({ id: user.id });

    user.is_onboarded = true;

    return { user };
  }
}
