import type { CredentialsType, SessionLoginWith, UserResource } from "@watcher/common";

declare module "#auth-utils" {
  interface User extends UserResource {
    login_with: {
      integration: SessionLoginWith;
      id: string;
    };
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Server-side session (`sessions` table): the cookie is only valid while this row exists
    session_id: string;

    // Set when the user asks to link a provider, see `server/utils/oauth.ts`
    link_intent?: {
      provider: CredentialsType;
      expires_at: number;
    };
  }
}

export {};
