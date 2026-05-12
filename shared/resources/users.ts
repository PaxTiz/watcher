export type UserResource = {
  id: string;

  name: string;

  bluesky: {
    did: string;

    handle: string;
  };

  created_at: string;

  last_login_at: string;
};
