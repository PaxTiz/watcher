import type { VideoPalette } from "../types/palette";
import type { SubscriptionType } from "../types/subscriptions";
import type { SubscriptionResource } from "./subscriptions";

export type VideoListResource = {
  id: string;

  service: SubscriptionType;

  author: SubscriptionResource;

  title: string;

  duration: number;

  viewing_progression: number; // percentage of view between 0 and 1

  url: string;

  thumbnails: {
    small: string;
    large: string;
  };

  palette: VideoPalette | null;

  created_at: string;

  is_hidden: boolean; // hidden by the user (videos of hidden channels are never returned)
};

export type VideoResource = VideoListResource & {
  description: string;
};
