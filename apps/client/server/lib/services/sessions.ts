import type { SessionResource } from "@watcher/common";
import { sessions } from "@watcher/database";
import { add } from "date-fns";
import { useStorage } from "nitropack/runtime";

import type { User } from "#auth-utils";
import { AbstractService, useLogger } from "#framework";

const LAST_SEEN_THROTTLE = 60 * 5 * 1000; // 5 minutes, in milliseconds
const RECENT_AUTHENTICATION_WINDOW = 60 * 10 * 1000; // 10 minutes, in milliseconds

const storage = useStorage<User>("sessions");

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

    useLogger("services.sessions").info(
      { session_user_id: user_id, session_id: id, login_with: login_with.integration },
      "Session created",
    );

    return id;
  }

  async find_user(id: string): Promise<User | null> {
    const cached = await storage.getItem(id);
    if (cached) {
      return cached;
    }

    const user = await this.load_user(id);
    if (user) {
      await storage.setItem(id, user);
    }

    return user;
  }

  async forget_user(user_id: string) {
    const ids = await storage.getKeys();

    await Promise.all(
      ids.map(async (id) => {
        const user = await storage.getItem(id);

        if (user?.id === user_id) {
          await storage.removeItem(id);
        }
      }),
    );
  }

  private async load_user(id: string): Promise<User | null> {
    const row = await sessions.find_active_with_user({ id });

    if (!row) {
      useLogger("services.sessions").debug({ session_id: id }, "Session not found, or expired");
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

  async is_recently_authenticated(id: string) {
    const row = await sessions.find_authenticated_at({ id });

    return (
      !!row && Date.now() - new Date(row.authenticated_at).getTime() < RECENT_AUTHENTICATION_WINDOW
    );
  }

  async mark_authenticated(id: string) {
    await sessions.mark_authenticated({ id });

    useLogger("services.sessions").info({ session_id: id }, "Session reauthenticated");
  }

  async list(user_id: string, current_id: string): Promise<Array<SessionResource>> {
    const rows = await sessions.find_all_active_by_user({ user_id });

    return rows.map((row) => ({ ...row, is_current: row.id === current_id }));
  }

  async revoke(id: string, user_id?: string) {
    const removed = await sessions.remove({ id, user_id });

    if (removed) {
      await storage.removeItem(id);
    }

    useLogger("services.sessions").info({ session_id: id, removed: !!removed }, "Session revoked");

    return removed;
  }

  async revoke_others(user_id: string, current_id: string) {
    await sessions.remove_all_by_user({ user_id, except_id: current_id });
    await this.forget_user(user_id);

    useLogger("services.sessions").info({ kept_session_id: current_id }, "Other sessions revoked");
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
    await this.forget_user(user_id);

    useLogger("services.sessions").info(
      { login_with: login_with.integration, kept_session_id: except_id },
      "Sessions of a login method revoked",
    );
  }
}
