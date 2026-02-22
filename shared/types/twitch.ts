export type Twitch = {
  Users: {
    List: {
      data: Array<{
        id: string;
        login: string;
        display_name: string;
        type: string;
        broadcaster_type: string;
        description: string;
        profile_image_url: string;
        offline_image_url: string;
        view_count: number;
        email: string;
        created_at: string;
      }>;
    };
  };

  Followers: {
    List: {
      total: number;
      data: Array<{
        broadcaster_id: string;
        broadcaster_login: string;
        broadcaster_name: string;
        followed_at: string;
        logo: string;
      }>;
      pagination: {
        cursor?: string;
      };
    };
  };
};
