import type { SessionResource } from "@watcher/common";
import { sessions } from "@watcher/database";
import { add } from "date-fns";

import type { User } from "#auth-utils";
import { AbstractService } from "#framework";

const LAST_SEEN_THROTTLE = 60 * 5 * 1000; // 5 minutes, in milliseconds

export default class SessionsService extends AbstractService {
  async create(
    user_id: string,
    login_with: User["login_with"],
    user_agent: string | null,
    duration: number,
  ) {
    const { id } = await sessions.create({
      data: {
        user_id,
        login_with: login_with.integration,
        login_with_id: login_with.id,
        user_agent,
        expires_at: add(new Date(), { seconds: duration }).toISOString(),
      },
    });

    return id;
  }

  async find_user(id: string): Promise<User | null> {
    const row = await sessions.find_active_with_user({ id });

    if (!row) {
      return null;
    }

    // Keeps track of the session activity, without writing on every request
    if (Date.now() - new Date(row.last_seen_at).getTime() > LAST_SEEN_THROTTLE) {
      await sessions.touch({ id });
    }

    return {
      id: row.id,
      name: row.name,
      integrations: {
        google: row.google_id,
        twitch: row.twitch_id,
      },
      is_onboarded: row.is_onboarded,
      created_at: row.created_at,
      last_login_at: row.last_login_at,
      login_with: {
        integration: row.login_with,
        id: row.login_with_id,
      },
    };
  }

  async list(user_id: string, current_id: string): Promise<Array<SessionResource>> {
    const rows = await sessions.find_all_active_by_user({ user_id });

    return rows.map((row) => ({ ...row, is_current: row.id === current_id }));
  }

  async revoke(id: string, user_id?: string) {
    return sessions.remove({ id, user_id });
  }

  async revoke_others(user_id: string, current_id: string) {
    await sessions.remove_all_by_user({ user_id, except_id: current_id });
  }

  async revoke_by_login_method(
    user_id: string,
    login_with: User["login_with"],
    except_id?: string,
  ) {
    await sessions.remove_by_login_method({
      user_id,
      login_with: login_with.integration,
      login_with_id: login_with.id,
      except_id,
    });
  }
}
