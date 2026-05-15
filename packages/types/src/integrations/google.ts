export type Google = {
  OAuth: {
    User: {
      id: string;
      email: string;
      gender: string;
      name: string;
      family_name: string;
      given_name: string;
      picture: string;
      verified_email: string;
      locale: string;
      link: string;
      hd: string;
    };
  };

  Youtube: {
    Videos: {
      Item: {
        id: string;
        contentDetails: {
          duration?: string;
        };
        snippet: {
          title: string;
          description: string;
          publishedAt: string;
          thumbnails: Google["Youtube"]["__Thumbnails"];
        };
      };

      List: {
        nextPageToken?: string;
        items: Array<Google["Youtube"]["Videos"]["Item"]>;
        pageInfo: Google["Youtube"]["__PageInfo"];
      };
    };

    PlaylistItems: {
      Item: {
        contentDetails: {
          videoId: string;
        };
      };

      List: {
        items: Array<Google["Youtube"]["PlaylistItems"]["Item"]>;
        pageInfo: Google["Youtube"]["__PageInfo"];
      };
    };

    Channels: {
      Item: {
        contentDetails: {
          relatedPlaylists: {
            uploads: string;
          };
        };
      };

      List: {
        items: Array<Google["Youtube"]["Channels"]["Item"]>;
        pageInfo: Google["Youtube"]["__PageInfo"];
      };
    };

    Subscriptions: {
      Item: {
        id: string;
        snippet: {
          channelId: string;
          title: string;
          description: string;
          publishedAt: string;
          thumbnails: Google["Youtube"]["__Thumbnails"];
          resourceId: {
            channelId: string;
            playlistId: string;
            videoId: string;
          };
        };
      };

      List: {
        items: Array<Google["Youtube"]["Subscriptions"]["Item"]>;
        nextPageToken?: string | null;
        pageInfo: Google["Youtube"]["__PageInfo"];
      };
    };

    __PageInfo: {
      resultsPerPage: number;
      totalResults: number;
    };

    __Thumbnails: {
      default: {
        width: number;
        height: number;
        url: string;
      };

      medium: {
        width: number;
        height: number;
        url: string;
      };
    };
  };
};
