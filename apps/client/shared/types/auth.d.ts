import type { UserResource } from "../resources/users";

declare module "#auth-utils" {
  interface User extends UserResource {
    loginWith: {
      integration: "google" | "twitch" | "bluesky";
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
