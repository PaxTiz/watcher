export type UserResource = {
  id: string;

  name: string;

  bluesky: {
    did: string | null;

    handle: string | null;
  };

  integrations: {
    google: string | null;
    twitch: string | null;
    bluesky: string | null;
  };

  is_onboarded: boolean;

  created_at: string;

  last_login_at: string;
};
