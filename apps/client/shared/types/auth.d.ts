import type { UserResource } from "@watcher/common";

declare module "#auth-utils" {
  interface User extends UserResource {
    login_with: {
      integration: "google" | "twitch" | "bluesky";
      id: string;
    };
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
