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
