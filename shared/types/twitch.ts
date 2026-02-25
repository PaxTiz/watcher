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

  Videos: {
    PlaybackAccessToken: {
      data?: {
        videoPlaybackAccessToken?: {
          value?: string;
          signature?: string;
        };
      };
    };

    List: {
      data: [
        {
          id: string;
          stream_id: string | null;
          user_id: string;
          user_login: string;
          user_name: string;
          title: string;
          description: string;
          created_at: string;
          published_at: string;
          url: string;
          thumbnail_url: string;
          viewable: "public";
          view_count: number;
          language: string;
          type: "archive" | "highlight" | "upload";
          duration: string;
          muted_segments: Array<{ duration: number; offset: number }>;
        },
      ];
      pagination: {
        cursor?: string;
      };
    };

    __INTERNAL__: {
      GetSingleVideo: {
        data?: {
          video?: {
            broadcastType: string;
            createdAt: string;
            seekPreviewsURL: string;
            owner: { login: string };
          };
        };
      };
    };
  };
};
