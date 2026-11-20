import { parseXml, XmlElement } from "@rgrove/parse-xml";
import { request_options, type Google } from "@watcher/common";
import { FetchError, ofetch } from "ofetch";

import type { GoogleClient } from "../internal/client";
import { GoogleService } from "../internal/service";

const find_child = (element: XmlElement, name: string) =>
  element.children.find(
    (node): node is XmlElement => node instanceof XmlElement && node.name === name,
  );

const get_text = (element: XmlElement, name: string) => {
  const child = find_child(element, name);
  if (!child) {
    throw new Error(`Missing <${name}> in the YouTube feed`);
  }

  return child.text;
};

const parse_feed = (xml: string): Array<Google["Youtube"]["Feeds"]["Entry"]> => {
  const feed = parseXml(xml).root;
  if (feed?.name !== "feed") {
    throw new Error(`Unexpected root <${feed?.name}> in the YouTube feed`);
  }

  return feed.children
    .filter((node): node is XmlElement => node instanceof XmlElement && node.name === "entry")
    .map((entry) => {
      const media = find_child(entry, "media:group");

      return {
        video_id: get_text(entry, "yt:videoId"),
        title: get_text(entry, "title"),
        description: media ? get_text(media, "media:description") : "",
        published_at: get_text(entry, "published"),
        updated_at: get_text(entry, "updated"),
      };
    });
};

export class YoutubeFeedsService extends GoogleService {
  constructor(client: GoogleClient) {
    super(client);
  }

  async list(data: { playlist_id: string }) {
    const url = new URL("https://www.youtube.com/feeds/videos.xml");
    url.searchParams.set("playlist_id", data.playlist_id);

    try {
      const xml = await ofetch(url.toString(), { ...request_options(), responseType: "text" });

      return parse_feed(xml);
    } catch (error) {
      if (error instanceof FetchError && error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }
}
