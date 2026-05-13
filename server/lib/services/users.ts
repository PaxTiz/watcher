import { AbstractService } from "#framework";
import { useDatabase } from "#server/database";
import type { UserTable } from "#server/database/schema";
import type { UserResource } from "#shared/resources/users";
import type { CredentialsType } from "#shared/types/credentials";

export default class UsersService extends AbstractService {
  async find_by_service_id({
    type,
    id,
  }: {
    type: CredentialsType;
    id: string;
  }): Promise<UserResource | null> {
    const database = useDatabase();

    const user = await database
      .selectFrom("users")
      .selectAll("users")
      .innerJoin("credentials", "users.id", "credentials.user_id")
      .where("credentials.service", "=", type)
      .where("credentials.service_id", "=", id)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      bluesky: {
        handle: user.bluesky_handle,
        did: user.bluesky_did,
      },
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    };
  }

  async create(
    data: Pick<UserTable, "name" | "bluesky_handle" | "bluesky_did">,
  ): Promise<UserResource> {
    const database = useDatabase();

    const user = await database
      .insertInto("users")
      .values({
        name: data.name,
        bluesky_handle: data.bluesky_handle,
        bluesky_did: data.bluesky_did,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: user.id,
      name: user.name,
      bluesky: {
        handle: user.bluesky_handle,
        did: user.bluesky_did,
      },
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    };
  }
}
