export type Youtube = {
  Videos: {
    Item: {
      id: string;
      contentDetails: {
        duration: string;
      };
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: Youtube["__Thumbnails"];
      };
    };

    List: {
      nextPageToken?: string;
      items: Array<Youtube["Videos"]["Item"]>;
      pageInfo: Youtube["__PageInfo"];
    };
  };

  PlaylistItems: {
    Item: {
      contentDetails: {
        videoId: string;
      };
    };

    List: {
      items: Array<Youtube["PlaylistItems"]["Item"]>;
      pageInfo: Youtube["__PageInfo"];
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
      items: Array<Youtube["Channels"]["Item"]>;
      pageInfo: Youtube["__PageInfo"];
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
        thumbnails: Youtube["__Thumbnails"];
        resourceId: {
          channelId: string;
          playlistId: string;
          videoId: string;
        };
      };
    };

    List: {
      items: Array<Youtube["Subscriptions"]["Item"]>;
      nextPageToken?: string | null;
      pageInfo: Youtube["__PageInfo"];
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
