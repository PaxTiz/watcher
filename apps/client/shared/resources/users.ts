export type UserResource = {
  id: string;

  name: string;

  bluesky: {
    did: string | null;

    handle: string | null;
  };

  created_at: string;

  last_login_at: string;
};
