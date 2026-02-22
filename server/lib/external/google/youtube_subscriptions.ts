import { youtube_v3 } from "googleapis";

export default class GoogleYoutubeSubscriptionsService {
  async list(token: string, cursor?: string) {
    const client = new youtube_v3.Youtube({});
    return client.subscriptions.list({
      part: ["snippet"],
      mine: true,
      maxResults: 50,
      pageToken: cursor,
      access_token: token,
    });
  }
}
