import { AbstractService } from "#framework";
import type { Youtube } from "#shared/types/youtube";

export default class GoogleYoutubeSubscriptionsService extends AbstractService {
  async list(token: string, cursor?: string) {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("mine", "true");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("access_token", token);

      if (cursor) {
        url.searchParams.set("pageToken", cursor);
      }

      const response = await $fetch<Youtube["Subscriptions"]["List"]>(url.toString());

      return response;
    } catch (e) {
      throw new Error("Failed to list YouTube subscriptions", { cause: e });
    }
  }
}
