import type { SessionLoginWith } from "../types/sessions";

export type UserResource = {
  id: string;

  name: string;

  integrations: {
    google: string | null;
    twitch: string | null;
  };

  is_onboarded: boolean;

  created_at: string;

  last_login_at: string;
};

export type PasskeyResource = {
  id: string;

  name: string;

  backed_up: boolean;

  created_at: string;

  last_used_at: string | null;
};

export type SessionResource = {
  id: string;

  login_with: SessionLoginWith;

  user_agent: string | null;

  created_at: string;

  last_seen_at: string;

  is_current: boolean;
};
